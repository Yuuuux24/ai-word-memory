"""
闯关进度接口路由
- POST /api/practice/save  保存用户单词闯关进度（upsert）
- POST /api/practice/reset 批量重置用户闯关进度
- GET  /api/practice/load  加载用户闯关进度
"""
import logging
from flask import Blueprint, request
from supabase_client import get_supabase
from datetime import datetime, timezone
from utils.response import json_response
from utils.auth import jwt_required

logger = logging.getLogger(__name__)

practice_bp = Blueprint('practice', __name__, url_prefix='/api/practice')


@practice_bp.route('/save', methods=['POST'])
@jwt_required
def save_progress():
    """
    保存单条闯关进度（upsert，需 JWT 鉴权）
    入参：{ word_id, correct_count, cooldown_remaining }，user_id 从 JWT 中获取
    """
    from flask import g
    try:
        body = request.get_json(silent=True)
        if not body:
            return json_response(code=400, msg='请求体不能为空')

        user_id = g.user_id
        word_id = body.get('word_id')
        correct_count = body.get('correct_count', 0)
        cooldown_remaining = body.get('cooldown_remaining', 0)

        if not word_id:
            return json_response(code=400, msg='缺少必填参数 word_id')

        supabase = get_supabase()

        # 查询是否已有记录
        existing = supabase.table('practice_progress') \
            .select('id') \
            .eq('user_id', user_id) \
            .eq('word_id', word_id) \
            .execute()

        now = datetime.now(timezone.utc).isoformat()
        data = {
            'user_id': user_id,
            'word_id': word_id,
            'correct_count': correct_count,
            'cooldown_remaining': cooldown_remaining,
            'updated_at': now,
        }

        if existing.data:
            supabase.table('practice_progress') \
                .update(data) \
                .eq('user_id', user_id) \
                .eq('word_id', word_id) \
                .execute()
        else:
            supabase.table('practice_progress').insert(data).execute()

        # 答对3次即掌握：同步写入 user_word_status + study_record
        REQUIRED_CORRECT = 3
        if correct_count >= REQUIRED_CORRECT:
            # 1) 标记已掌握
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

            # 2) 写入学习记录
            record_existing = supabase.table('study_record') \
                .select('id') \
                .eq('user_id', user_id) \
                .eq('word_id', word_id) \
                .execute()
            if record_existing.data:
                supabase.table('study_record') \
                    .update({'study_date': now}) \
                    .eq('id', record_existing.data[0]['id']) \
                    .execute()
            else:
                supabase.table('study_record') \
                    .insert({'user_id': user_id, 'word_id': word_id, 'study_date': now}) \
                    .execute()

        return json_response(msg='进度已更新' if existing.data else '进度已保存')

    except Exception:
        logger.exception('Failed to save practice progress')
        return json_response(code=500, msg='保存闯关进度失败，请稍后重试')


@practice_bp.route('/load', methods=['GET'])
@jwt_required
def load_progress():
    """
    加载用户所有闯关进度（需 JWT 鉴权）
    可选 word_ids 逗号分隔过滤
    """
    from flask import g
    try:
        user_id = g.user_id

        supabase = get_supabase()

        query = supabase.table('practice_progress') \
            .select('*') \
            .eq('user_id', user_id)

        result = query.execute()

        progress_map = {}
        if result.data:
            for row in result.data:
                progress_map[row['word_id']] = {
                    'correct_count': row.get('correct_count', 0),
                    'cooldown_remaining': row.get('cooldown_remaining', 0),
                }

        return json_response(data={'progress': progress_map, 'total': len(progress_map)})

    except Exception:
        logger.exception('Failed to load practice progress')
        return json_response(code=500, msg='加载闯关进度失败，请稍后重试')


@practice_bp.route('/reset', methods=['POST'])
@jwt_required
def reset_progress():
    """
    批量重置用户闯关进度（需 JWT 鉴权，单次请求替代 N 条 save 请求）
    入参：{ word_ids: [1, 2, 3, ...] }，不传则清空全部进度
    """
    from flask import g
    try:
        body = request.get_json(silent=True) or {}
        word_ids = body.get('word_ids')
        user_id = g.user_id

        supabase = get_supabase()

        query = supabase.table('practice_progress').delete().eq('user_id', user_id)
        if word_ids and isinstance(word_ids, list):
            query = query.in_('word_id', word_ids)

        result = query.execute()
        deleted_count = len(result.data) if result.data else 0
        logger.info('User %d reset %d practice progress records', user_id, deleted_count)
        return json_response(data={'deleted': deleted_count}, msg='闯关进度已重置')

    except Exception:
        logger.exception('Failed to reset practice progress')
        return json_response(code=500, msg='重置闯关进度失败，请稍后重试')
