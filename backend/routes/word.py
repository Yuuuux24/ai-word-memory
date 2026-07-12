"""
单词相关接口路由
- GET /api/words           分页单词列表
- GET /api/words/<word_id> 单词详情
"""
from flask import Blueprint, jsonify, request
from supabase_client import get_supabase

# 创建蓝图，URL 前缀为 /api/words
word_bp = Blueprint('word', __name__, url_prefix='/api/words')


def json_response(code=200, data=None, msg='success'):
    """统一 JSON 返回结构"""
    return jsonify({'code': code, 'data': data, 'msg': msg})


@word_bp.route('', methods=['GET'])
def get_words():
    """
    分页获取单词列表
    入参：page（页码，默认1）、size（每页条数，默认10）
    """
    try:
        page = request.args.get('page', 1, type=int)
        size = request.args.get('size', 10, type=int)

        # 参数校验与兜底
        if page < 1:
            page = 1
        if size < 1:
            size = 10
        if size > 50:  # 防止单次请求过大
            size = 50

        supabase = get_supabase()

        # 查询总条数
        count_result = supabase.table('words').select('id', count='exact').execute()
        total = count_result.count if count_result.count else 0

        # 计算分页偏移
        offset = (page - 1) * size

        # 页码越界兜底
        if offset >= total and total > 0:
            offset = max(0, total - size)
            page = (offset // size) + 1

        # 查询单词数据
        result = supabase.table('words') \
            .select('*') \
            .order('id', desc=False) \
            .range(offset, offset + size - 1) \
            .execute()

        words = result.data if result.data else []

        return json_response(data={
            'list': words,
            'total': total,
            'page': page,
            'size': size
        })

    except Exception as e:
        return json_response(code=500, msg=f'获取单词列表失败: {str(e)}')


@word_bp.route('/<int:word_id>', methods=['GET'])
def get_word_detail(word_id):
    """
    根据单词 ID 查单条详情
    """
    try:
        supabase = get_supabase()

        result = supabase.table('words') \
            .select('*') \
            .eq('id', word_id) \
            .execute()

        if not result.data:
            return json_response(code=404, msg=f'单词 ID {word_id} 不存在')

        return json_response(data=result.data[0])

    except Exception as e:
        return json_response(code=500, msg=f'获取单词详情失败: {str(e)}')
