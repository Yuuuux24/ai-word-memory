"""
学习记录接口路由 — 基于实际 Supabase 表结构
study_record: id, user_id, word_id, memory_content, study_date
words: id, word, phonetic, basic_meaning, created_at
user_word_status: user_id, word_id, review_status
"""
import logging
from flask import Blueprint, request, g
from supabase_client import get_supabase
from datetime import datetime, timezone
from utils.response import json_response
from utils.auth import jwt_required

logger = logging.getLogger(__name__)

record_bp = Blueprint('record', __name__, url_prefix='/api/study')


def _user_word_status_map(user_id):
    """查询用户全部单词状态，返回 {word_id: review_status}"""
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


@record_bp.route('/add', methods=['POST'])
@jwt_required
def add_study_record():
    """新增学习记录（需 JWT 鉴权）"""
    try:
        body = request.get_json(silent=True)
        if not body:
            return json_response(code=400, msg='请求体不能为空')

        user_id = g.user_id
        word_id = body.get('word_id')

        if not word_id:
            return json_response(code=400, msg='缺少必填参数 word_id')

        try:
            word_id = int(word_id)
        except (ValueError, TypeError):
            return json_response(code=400, msg='word_id 必须为整数')

        supabase = get_supabase()

        # 校验单词存在
        wr = supabase.table('words').select('id,word').eq('id', word_id).execute()
        if not wr.data:
            return json_response(code=404, msg=f'单词 ID {word_id} 不存在')

        # 已有记录更新或新建
        existing = supabase.table('study_record').select('*').eq('user_id', user_id).eq('word_id', word_id).execute()
        if existing.data:
            supabase.table('study_record').update({'study_date': datetime.now(timezone.utc).isoformat()}).eq('id', existing.data[0]['id']).execute()
        else:
            supabase.table('study_record').insert({
                'user_id': user_id,
                'word_id': word_id,
                'study_date': datetime.now(timezone.utc).isoformat(),
            }).execute()

        # 同步标记为已掌握
        status_existing = supabase.table('user_word_status') \
            .select('id') \
            .eq('user_id', user_id) \
            .eq('word_id', word_id) \
            .execute()
        if status_existing.data:
            supabase.table('user_word_status') \
                .update({'review_status': 1}) \
                .eq('id', status_existing.data[0]['id']) \
                .execute()
        else:
            supabase.table('user_word_status') \
                .insert({'user_id': user_id, 'word_id': word_id, 'review_status': 1}) \
                .execute()

        return json_response(msg='学习记录保存成功')
    except Exception:
        logger.exception('Failed to save study record')
        return json_response(code=500, msg='保存学习记录失败，请稍后重试')


@record_bp.route('/list', methods=['GET'])
@jwt_required
def get_study_list():
    """分页查询用户学习记录，关联单词信息，支持日期筛选和 review_status 筛选（需 JWT 鉴权）"""
    try:
        user_id = g.user_id

        page = request.args.get('page', 1, type=int)
        size = request.args.get('size', 10, type=int)
        filter_date = request.args.get('date', '').strip()
        review_status = request.args.get('review_status', type=int)

        if page < 1:
            page = 1
        if size < 1:
            size = 10
        if size > 50:
            size = 50

        supabase = get_supabase()

        select_fields = '*, words!inner(id,word,phonetic,basic_meaning)'

        # 第一步：用 count='exact' + limit(0) 只取总数，不拉数据
        count_query = supabase.table('study_record').select(select_fields, count='exact').eq('user_id', user_id)
        if filter_date:
            count_query = count_query.gte('study_date', filter_date + 'T00:00:00').lt('study_date', filter_date + 'T23:59:59')
        count_result = count_query.limit(0).execute()
        raw_total = count_result.count if count_result.count else 0

        # 第二步：拉取数据（不依赖 words.review_status，改为查询 user_word_status）
        data_query = supabase.table('study_record').select(select_fields).eq('user_id', user_id)
        if filter_date:
            data_query = data_query.gte('study_date', filter_date + 'T00:00:00').lt('study_date', filter_date + 'T23:59:59')
        data_query = data_query.order('study_date', desc=True)

        if review_status is not None:
            # 需要按状态过滤：先拉全部数据，Python 侧过滤
            data_result = data_query.range(0, raw_total - 1).execute() if raw_total > 0 else None
        else:
            # 不需要过滤：数据库层直接分页
            offset = (page - 1) * size
            if offset >= raw_total and raw_total > 0:
                offset = max(0, raw_total - size)
                page = (offset // size) + 1
            data_result = data_query.range(offset, offset + size - 1).execute() if raw_total > 0 else None

        # 构建记录列表
        all_data = data_result.data if (data_result and data_result.data) else []
        status_map = _user_word_status_map(user_id)
        records = []
        for r in all_data:
            wi = r.get('words', {})
            ws = status_map.get(r['word_id'], 0)
            # Python 侧兜底过滤 review_status
            if review_status is not None and review_status in (0, 1):
                if ws != review_status:
                    continue
            records.append({
                'id': r['id'],
                'user_id': r['user_id'],
                'word_id': r['word_id'],
                'word': wi.get('word', ''),
                'phonetic': wi.get('phonetic', ''),
                'meaning': wi.get('basic_meaning', ''),
                'review_status': ws,
                'study_date': r.get('study_date'),
            })

        # total 应根据是否有 review_status 过滤区分计算
        if review_status is not None:
            # Python 侧过滤后，total 为过滤后的总数
            total = len(records)
            # 分页切片
            offset = (page - 1) * size
            if offset >= total and total > 0:
                offset = max(0, total - size)
                page = (offset // size) + 1
            records = records[offset:offset + size]
        else:
            # 数据库层分页，total 直接使用 raw_total
            total = raw_total

        return json_response(data={'list': records, 'total': total, 'page': page, 'size': size})
    except Exception:
        logger.exception('Failed to query study records')
        return json_response(code=500, msg='查询学习记录失败，请稍后重试')


@record_bp.route('/<int:record_id>', methods=['DELETE'])
@jwt_required
def delete_study_record(record_id):
    """删除学习记录（需 JWT 鉴权）"""
    try:
        supabase = get_supabase()

        # 校验记录存在且属于当前用户
        check = supabase.table('study_record').select('id,user_id').eq('id', record_id).execute()
        if not check.data:
            return json_response(code=404, msg='学习记录不存在')
        if check.data[0]['user_id'] != g.user_id:
            return json_response(code=403, msg='无权删除他人的学习记录')

        supabase.table('study_record').delete().eq('id', record_id).execute()
        return json_response(msg='学习记录已删除')
    except Exception:
        logger.exception('Failed to delete study record')
        return json_response(code=500, msg='删除学习记录失败，请稍后重试')

