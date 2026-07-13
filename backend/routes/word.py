"""
单词相关接口路由
- GET  /api/words           分页单词列表
- GET  /api/words/<word_id> 单词详情
- POST /api/words           新增单词（带查重）
"""
from flask import Blueprint, jsonify, request
from supabase_client import get_supabase

word_bp = Blueprint('word', __name__, url_prefix='/api/words')


def json_response(code=200, data=None, msg='success'):
    return jsonify({'code': code, 'data': data, 'msg': msg})


@word_bp.route('', methods=['GET'])
def get_words():
    """分页获取单词列表"""
    try:
        page = request.args.get('page', 1, type=int)
        size = request.args.get('size', 10, type=int)

        if page < 1:
            page = 1
        if size < 1:
            size = 10
        if size > 50:
            size = 50

        supabase = get_supabase()

        count_result = supabase.table('words').select('id', count='exact').execute()
        total = count_result.count if count_result.count else 0

        offset = (page - 1) * size
        if offset >= total and total > 0:
            offset = max(0, total - size)
            page = (offset // size) + 1

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
    """根据单词 ID 查单条详情"""
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


@word_bp.route('', methods=['POST'])
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
        return json_response(code=500, msg=f'添加单词失败: {str(e)}')
