"""
学习记录接口路由 — 基于实际 Supabase 表结构
study_record: id, user_id, word_id, memory_content, study_date
words: id, word, phonetic, basic_meaning, created_at
"""
from flask import Blueprint, jsonify, request
from supabase_client import get_supabase
from datetime import datetime, timezone

record_bp = Blueprint('record', __name__, url_prefix='/api/study')


def json_response(code=200, data=None, msg='success'):
    return jsonify({'code': code, 'data': data, 'msg': msg})


@record_bp.route('/add', methods=['POST'])
def add_study_record():
    """新增学习记录"""
    try:
        body = request.get_json(silent=True)
        if not body:
            return json_response(code=400, msg='请求体不能为空')

        user_id = body.get('user_id')
        word_id = body.get('word_id')

        if not user_id or not word_id:
            return json_response(code=400, msg='缺少必填参数 user_id 或 word_id')

        try:
            user_id = int(user_id)
            word_id = int(word_id)
        except (ValueError, TypeError):
            return json_response(code=400, msg='user_id 和 word_id 必须为整数')

        supabase = get_supabase()

        # 校验用户存在
        ur = supabase.table('users').select('id').eq('id', user_id).execute()
        if not ur.data:
            return json_response(code=404, msg=f'用户 ID {user_id} 不存在')

        # 校验单词存在
        wr = supabase.table('words').select('id,word').eq('id', word_id).execute()
        if not wr.data:
            return json_response(code=404, msg=f'单词 ID {word_id} 不存在')

        # 已有记录更新或新建
        existing = supabase.table('study_record').select('*').eq('user_id', user_id).eq('word_id', word_id).execute()
        if existing.data:
            supabase.table('study_record').update({'study_date': datetime.now(timezone.utc).isoformat()}).eq('id', existing.data[0]['id']).execute()
            return json_response(msg='复习记录已更新')
        else:
            supabase.table('study_record').insert({
                'user_id': user_id,
                'word_id': word_id,
                'study_date': datetime.now(timezone.utc).isoformat(),
            }).execute()
            return json_response(msg='学习记录保存成功')
    except Exception as e:
        return json_response(code=500, msg='保存学习记录失败，请稍后重试')


@record_bp.route('/list', methods=['GET'])
def get_study_list():
    """分页查询用户学习记录，关联单词信息，支持日期筛选"""
    try:
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            return json_response(code=400, msg='缺少必填参数 user_id')

        page = request.args.get('page', 1, type=int)
        size = request.args.get('size', 10, type=int)
        filter_date = request.args.get('date', '').strip()

        if page < 1:
            page = 1
        if size < 1:
            size = 10
        if size > 50:
            size = 50

        supabase = get_supabase()

        # 构建查询
        query = supabase.table('study_record').select('*, words!inner(id,word,phonetic,basic_meaning)')

        # 日期筛选：匹配 study_date 字段（日期部分的字符串比较）
        if filter_date:
            query = query.gte('study_date', filter_date + 'T00:00:00').lt('study_date', filter_date + 'T23:59:59')

        query = query.eq('user_id', user_id)

        # 先查总数（limit(0) 只返回 count，不拉数据）
        count_query = supabase.table('study_record').select('id', count='exact').eq('user_id', user_id)
        if filter_date:
            count_query = count_query.gte('study_date', filter_date + 'T00:00:00').lt('study_date', filter_date + 'T23:59:59')
        count_result = count_query.limit(0).execute()
        total = count_result.count if count_result.count else 0

        # 分页
        offset = (page - 1) * size
        if offset >= total and total > 0:
            offset = max(0, total - size)
            page = (offset // size) + 1

        result = query.order('study_date', desc=True) \
            .range(offset, offset + size - 1) \
            .execute()

        records = []
        if result.data:
            for r in result.data:
                wi = r.get('words', {})
                records.append({
                    'id': r['id'],
                    'user_id': r['user_id'],
                    'word_id': r['word_id'],
                    'word': wi.get('word', ''),
                    'phonetic': wi.get('phonetic', ''),
                    'meaning': wi.get('basic_meaning', ''),
                    'study_date': r.get('study_date'),
                })

        return json_response(data={'list': records, 'total': total, 'page': page, 'size': size})
    except Exception as e:
        return json_response(code=500, msg='查询学习记录失败，请稍后重试')
