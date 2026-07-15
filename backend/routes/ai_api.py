"""
AI 交互接口路由
- POST /api/ai/memo   获取单词记忆素材（词根解析、记忆口诀、日常例句）
"""
from flask import Blueprint, jsonify, request
from supabase_client import get_supabase

# 创建蓝图，URL 前缀为 /api/ai
ai_api_bp = Blueprint('ai_api', __name__, url_prefix='/api/ai')


def json_response(code=200, data=None, msg='success'):
    """统一 JSON 返回结构"""
    return jsonify({'code': code, 'data': data, 'msg': msg})


@ai_api_bp.route('/memo', methods=['POST'])
def ai_memo():
    """
    获取单词记忆素材（从数据库读取预生成内容）
    入参：word_id（单词ID）
    返回：词根解析、趣味口诀、日常例句
    """
    try:
        # 参数校验
        body = request.get_json(silent=True)
        if not body or 'word_id' not in body:
            return json_response(code=400, msg='缺少必填参数 word_id')

        word_id = body.get('word_id')

        # 参数类型校验
        if not isinstance(word_id, int):
            try:
                word_id = int(word_id)
            except (ValueError, TypeError):
                return json_response(code=400, msg='word_id 必须为整数')

        # 从数据库查询单词（含预生成的记忆素材字段）
        supabase = get_supabase()
        result = supabase.table('words').select(
            'id,word,phonetic,basic_meaning,root_analysis,mnemonic,extra_example'
        ).eq('id', word_id).execute()

        if not result.data:
            return json_response(code=404, msg=f'单词 ID {word_id} 不存在')

        word = result.data[0]

        memo_data = {
            'word_id': word_id,
            'word': word['word'],
            'root_analysis': word.get('root_analysis') or f'"{word["word"]}" 暂无词根解析，可尝试按音节拆解记忆。',
            'mnemonic': word.get('mnemonic') or f'记「{word["word"]}」很简单：想象一下{word.get("basic_meaning", "")}的场景，这个单词就刻在脑海里啦！',
            'extra_example': word.get('extra_example') or f"I find the word '{word['word']}' very useful in daily life.",
        }

        return json_response(data=memo_data)

    except RuntimeError as e:
        return json_response(code=500, msg='数据库连接异常，请稍后重试')
    except Exception as e:
        return json_response(code=500, msg='获取记忆素材失败，请稍后重试')
