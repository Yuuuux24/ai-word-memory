"""
闯关进度接口路由
- POST /api/practice/save  保存用户单词闯关进度（upsert）
- GET  /api/practice/load  加载用户闯关进度
"""
from flask import Blueprint, jsonify, request
from supabase_client import get_supabase
from datetime import datetime, timezone

practice_bp = Blueprint('practice', __name__, url_prefix='/api/practice')


def json_response(code=200, data=None, msg='success'):
    return jsonify({'code': code, 'data': data, 'msg': msg})


@practice_bp.route('/save', methods=['POST'])
def save_progress():
    """
    保存单条闯关进度（upsert）
    入参：{ user_id, word_id, correct_count, cooldown_remaining }
    """
    try:
        body = request.get_json(silent=True)
        if not body:
            return json_response(code=400, msg='请求体不能为空')

        user_id = body.get('user_id')
        word_id = body.get('word_id')
        correct_count = body.get('correct_count', 0)
        cooldown_remaining = body.get('cooldown_remaining', 0)

        if not user_id or not word_id:
            return json_response(code=400, msg='缺少必填参数 user_id 或 word_id')

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
            return json_response(msg='进度已更新')
        else:
            supabase.table('practice_progress').insert(data).execute()
            return json_response(msg='进度已保存')

    except Exception as e:
        return json_response(code=500, msg=f'保存闯关进度失败: {str(e)}')


@practice_bp.route('/load', methods=['GET'])
def load_progress():
    """
    加载用户所有闯关进度
    参数：user_id
    可选 word_ids 逗号分隔过滤
    """
    try:
        user_id = request.args.get('user_id', type=int)
        if not user_id:
            return json_response(code=400, msg='缺少必填参数 user_id')

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

    except Exception as e:
        return json_response(code=500, msg=f'加载闯关进度失败: {str(e)}')
