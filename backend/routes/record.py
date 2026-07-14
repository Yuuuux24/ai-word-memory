"""
学习记录接口路由 — 基于实际 Supabase 表结构
study_record: id, user_id, word_id, memory_content, study_date
words: id, word, phonetic, basic_meaning, created_at, review_status
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
    except Exception:
        return json_response(code=500, msg='保存学习记录失败，请稍后重试')


@record_bp.route('/list', methods=['GET'])
def get_study_list():
    """分页查询用户学习记录，关联单词信息，支持日期筛选和 review_status 筛选"""
    try:
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            return json_response(code=400, msg='缺少必填参数 user_id')

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

        select_fields = '*, words!inner(id,word,phonetic,basic_meaning,review_status)'

        # 第一步：用 count='exact' + limit(0) 只取总数，不拉数据
        count_query = supabase.table('study_record').select(select_fields, count='exact').eq('user_id', user_id)
        if filter_date:
            count_query = count_query.gte('study_date', filter_date + 'T00:00:00').lt('study_date', filter_date + 'T23:59:59')
        count_result = count_query.limit(0).execute()
        raw_total = count_result.count if count_result.count else 0

        # 第二步：分页拉取（数据库层分页，减少网络传输）
        # 拉取比当前页更多的数据，用于 Python 侧 review_status 过滤后仍够分
        fetch_size = raw_total if review_status is not None else min(size, raw_total)
        data_query = supabase.table('study_record').select(select_fields).eq('user_id', user_id)
        if filter_date:
            data_query = data_query.gte('study_date', filter_date + 'T00:00:00').lt('study_date', filter_date + 'T23:59:59')
        data_query = data_query.order('study_date', desc=True)

        if review_status is not None:
            # 需要过滤 review_status：拉全部数据在 Python 侧过滤（Supabase REST API 无法对 JOIN 字段做 .eq）
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
        records = []
        for r in all_data:
            wi = r.get('words', {})
            # Python 侧兜底过滤 review_status
            if review_status is not None and review_status in (0, 1):
                ws = wi.get('review_status')
                if ws is None:
                    ws = 0
                if ws != review_status:
                    continue
            records.append({
                'id': r['id'],
                'user_id': r['user_id'],
                'word_id': r['word_id'],
                'word': wi.get('word', ''),
                'phonetic': wi.get('phonetic', ''),
                'meaning': wi.get('basic_meaning', ''),
                'review_status': wi.get('review_status'),
                'study_date': r.get('study_date'),
            })

        total = len(records)

        # 分页切片（review_status 过滤时在 Python 侧切片）
        if review_status is not None:
            offset = (page - 1) * size
            if offset >= total and total > 0:
                offset = max(0, total - size)
                page = (offset // size) + 1
            records = records[offset:offset + size]

        return json_response(data={'list': records, 'total': total, 'page': page, 'size': size})
    except Exception:
        return json_response(code=500, msg='查询学习记录失败，请稍后重试')


@record_bp.route('/<int:record_id>', methods=['DELETE'])
def delete_study_record(record_id):
    """删除学习记录"""
    try:
        supabase = get_supabase()

        check = supabase.table('study_record').select('id').eq('id', record_id).execute()
        if not check.data:
            return json_response(code=404, msg='学习记录不存在')

        supabase.table('study_record').delete().eq('id', record_id).execute()
        return json_response(msg='学习记录已删除')
    except Exception:
        return json_response(code=500, msg='删除学习记录失败，请稍后重试')
