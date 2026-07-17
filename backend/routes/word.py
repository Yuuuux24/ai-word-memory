"""
单词相关接口路由
- GET  /api/words           分页单词列表（公开，登录用户带个人复习状态）
- GET  /api/words/<word_id> 单词详情（公开，登录用户带个人复习状态）
- POST /api/words           新增单词（需 JWT 鉴权）
- PUT  /api/words/<word_id>/status 更新当前用户复习状态
"""
import logging
from datetime import datetime, timezone
from flask import Blueprint, request, g
from supabase_client import get_supabase
from utils.response import json_response
from utils.auth import optional_auth, jwt_required

logger = logging.getLogger(__name__)

word_bp = Blueprint('word', __name__, url_prefix='/api/words')


def _user_status_map(user_id):
    """查询用户全部单词状态，返回 {word_id: review_status}"""
    if not user_id:
        return {}
    try:
        supabase = get_supabase()
        result = supabase.table('user_word_status') \
            .select('word_id,review_status') \
            .eq('user_id', user_id) \
            .execute()
        return {row['word_id']: row.get('review_status', 0) for row in (result.data or [])}
    except Exception:
        logger.exception('Failed to load user_word_status for user_id=%s', user_id)
        return {}


def _attach_user_status(words, user_id):
    """将用户状态合并到单词列表中"""
    if not user_id or not words:
        return words
    status_map = _user_status_map(user_id)
    for w in words:
        w['review_status'] = status_map.get(w['id'], 0)
    return words


@word_bp.route('', methods=['GET'])
@optional_auth
def get_words():
    """分页获取单词列表，支持 keyword 模糊搜索，登录用户带个人状态"""
    try:
        page = request.args.get('page', 1, type=int)
        size = request.args.get('size', 10, type=int)
        keyword = request.args.get('keyword', '').strip()

        if page < 1:
            page = 1
        if size < 1:
            size = 10
        if size > 50:
            size = 50

        supabase = get_supabase()

        # 构建查询
        query = supabase.table('words').select('*', count='exact')

        if keyword:
            # 模糊搜索：word 或 basic_meaning 包含关键词
            query = query.or_(f"word.ilike.%{keyword}%,basic_meaning.ilike.%{keyword}%")

        query = query.order('id', desc=False)

        # 先查总数
        count_result = query.limit(0).execute()
        total = count_result.count if count_result.count else 0

        # 分页
        offset = (page - 1) * size
        if offset >= total and total > 0:
            offset = max(0, total - size)
            page = (offset // size) + 1

        result = query.range(offset, offset + size - 1).execute()
        words = result.data if result.data else []

        # 合并当前用户状态
        user_id = getattr(g, 'user_id', None)
        words = _attach_user_status(words, user_id)

        return json_response(data={
            'list': words,
            'total': total,
            'page': page,
            'size': size,
            'keyword': keyword if keyword else None
        })

    except Exception:
        logger.exception('Failed to get words list')
        return json_response(code=500, msg='获取单词列表失败，请稍后重试')


@word_bp.route('/<int:word_id>', methods=['GET'])
@optional_auth
def get_word_detail(word_id):
    """根据单词 ID 查单条详情，登录用户带个人状态"""
    try:
        supabase = get_supabase()
        result = supabase.table('words') \
            .select('*') \
            .eq('id', word_id) \
            .execute()

        if not result.data:
            return json_response(code=404, msg=f'单词 ID {word_id} 不存在')

        word = result.data[0]
        user_id = getattr(g, 'user_id', None)
        if user_id:
            word['review_status'] = _user_status_map(user_id).get(word_id, 0)
        else:
            word['review_status'] = 0

        return json_response(data=word)

    except Exception:
        logger.exception('Failed to get word detail for id=%d', word_id)
        return json_response(code=500, msg='获取单词详情失败，请稍后重试')


@word_bp.route('', methods=['POST'])
@jwt_required
def add_word():
    """
    新增单词（带查重逻辑）
    入参：{ "word": "xxx", "phonetic": "xxx", "basic_meaning": "xxx" }
    如果同名单词已存在，直接返回已有单词并提示
    """
    try:
        body = request.get_json(silent=True)
        if not body or 'word' not in body:
            return json_response(code=400, msg='缺少必填参数 word')

        word_text = body.get('word', '').strip()
        if not word_text:
            return json_response(code=400, msg='单词不能为空')

        phonetic = body.get('phonetic', '')
        basic_meaning = body.get('basic_meaning', '')

        supabase = get_supabase()

        # 查重：检查是否已存在同名单词
        existing = supabase.table('words') \
            .select('*') \
            .eq('word', word_text) \
            .execute()

        if existing.data and len(existing.data) > 0:
            return json_response(
                code=200,
                data=existing.data[0],
                msg=f'单词"{word_text}"已存在，无需重复添加'
            )

        # 不存在则插入
        insert_data = {'word': word_text}
        if phonetic:
            insert_data['phonetic'] = phonetic
        if basic_meaning:
            insert_data['basic_meaning'] = basic_meaning

        result = supabase.table('words').insert(insert_data).execute()

        if result.data:
            return json_response(data=result.data[0], msg='单词添加成功')
        else:
            return json_response(code=500, msg='单词添加失败')

    except Exception as e:
        err_msg = str(e)
        if 'duplicate' in err_msg.lower() or 'unique' in err_msg.lower():
            return json_response(code=200, data=None, msg=f'单词"{word_text}"已存在，无需重复添加')
        logger.exception('Failed to add word')
        return json_response(code=500, msg='添加单词失败，请稍后重试')


@word_bp.route('/<int:word_id>/status', methods=['PUT'])
@jwt_required
def update_word_status(word_id):
    """
    更新当前用户对该单词的复习状态
    入参：{ "review_status": 0 或 1 }
    review_status: 0=待复习, 1=已掌握
    """
    try:
        body = request.get_json(silent=True)
        if not body or 'review_status' not in body:
            return json_response(code=400, msg='缺少必填参数 review_status')

        review_status = int(body['review_status'])
        if review_status not in (0, 1):
            return json_response(code=400, msg='review_status 必须为 0 或 1')

        user_id = g.user_id
        supabase = get_supabase()

        # 校验单词存在
        check = supabase.table('words').select('id').eq('id', word_id).execute()
        if not check.data:
            return json_response(code=404, msg='单词不存在')

        # 写入用户状态表（存在则更新，不存在则插入）
        existing = supabase.table('user_word_status') \
            .select('id') \
            .eq('user_id', user_id) \
            .eq('word_id', word_id) \
            .execute()

        if existing.data:
            supabase.table('user_word_status') \
                .update({'review_status': review_status}) \
                .eq('id', existing.data[0]['id']) \
                .execute()
        else:
            supabase.table('user_word_status') \
                .insert({'user_id': user_id, 'word_id': word_id, 'review_status': review_status}) \
                .execute()

        # 标记为已掌握时，同步写入/更新 study_record 学习记录
        if review_status == 1:
            record_existing = supabase.table('study_record') \
                .select('id') \
                .eq('user_id', user_id) \
                .eq('word_id', word_id) \
                .execute()
            if record_existing.data:
                supabase.table('study_record') \
                    .update({'study_date': datetime.now(timezone.utc).isoformat()}) \
                    .eq('id', record_existing.data[0]['id']) \
                    .execute()
            else:
                supabase.table('study_record') \
                    .insert({
                        'user_id': user_id,
                        'word_id': word_id,
                        'study_date': datetime.now(timezone.utc).isoformat(),
                    }) \
                    .execute()

        status_text = '已掌握' if review_status == 1 else '待复习'
        return json_response(data={'word_id': word_id, 'review_status': review_status}, msg=f'单词已标记为"{status_text}"')

    except Exception as e:
        logger.exception('Failed to update word status for id=%d', word_id)
        return json_response(code=500, msg='更新单词状态失败，请稍后重试')


@word_bp.route('/<int:word_id>', methods=['DELETE'])
@jwt_required
def delete_word(word_id):
    """删除单词"""
    try:
        supabase = get_supabase()

        check = supabase.table('words').select('id,word').eq('id', word_id).execute()
        if not check.data:
            return json_response(code=404, msg='单词不存在')

        word_text = check.data[0].get('word', '')
        supabase.table('words').delete().eq('id', word_id).execute()
        return json_response(msg=f'单词"{word_text}"已删除')
    except Exception:
        logger.exception('Failed to delete word id=%d', word_id)
        return json_response(code=500, msg='删除单词失败，请稍后重试')

