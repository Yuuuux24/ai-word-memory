"""
AI 记忆素材路由
- POST /api/ai/memo      从数据库读取预生成记忆素材
- POST /api/ai/generate   从数据库读取预生成素材（按 style 返回不同风格，纯本地，零API费用）
"""
import json as _json
from flask import Blueprint, jsonify, request

from supabase_client import get_supabase

# 创建蓝图，URL 前缀为 /api/ai
ai_api_bp = Blueprint('ai_api', __name__, url_prefix='/api/ai')

# 风格的备选 key 顺序（数据库 mnemonic JSON 可能只有一种 key，逐级兜底）
STYLE_FALLBACK = {
    'simple':   ['simple', 'story', 'mnemonic'],
    'story':    ['story', 'mnemonic', 'simple'],
    'mnemonic': ['mnemonic', 'simple', 'story'],
}


# ==================== 统一返回 ====================
def json_response(code=200, data=None, msg='success'):
    return jsonify({'code': code, 'data': data, 'msg': msg})


def _parse_mnemonic(raw, word, style):
    """解析 mnemonic 字段，支持 JSON 多风格 或 纯文本兜底"""
    if not raw:
        return _default_mnemonic(word)

    # 尝试解析 JSON
    try:
        parsed = _json.loads(raw)
        if isinstance(parsed, dict):
            # 按 STYLE_FALLBACK 顺序寻找第一个存在的 key
            for key in STYLE_FALLBACK.get(style, ['simple']):
                if key in parsed and parsed[key]:
                    return parsed[key]
            # JSON 解析了但没有对应 key，取第一个值
            first_val = next(iter(parsed.values()), '')
            return first_val if first_val else _default_mnemonic(word)
    except (_json.JSONDecodeError, TypeError, StopIteration):
        pass

    # 纯文本兜底
    return raw or _default_mnemonic(word)


def _default_mnemonic(word):
    return f'记「{word}」很简单，多读多练就记住了！'


def _read_word_from_db(word_id, style='simple'):
    """从数据库读取单词及预生成记忆素材，按 style 返回对应风格"""
    supabase = get_supabase()
    result = supabase.table('words').select(
        'id,word,phonetic,basic_meaning,root_analysis,mnemonic,extra_example'
    ).eq('id', word_id).execute()

    if not result.data:
        return None

    word = result.data[0]
    return {
        'word_id': word_id,
        'word': word['word'],
        'root': word.get('root_analysis') or word['word'],
        'mnemonic': _parse_mnemonic(word.get('mnemonic'), word['word'], style),
        'examples': [word.get('extra_example') or f"I find the word '{word['word']}' very useful."],
        'from_cache': False,
    }


# ==================== 路由：从数据库读取 ====================
@ai_api_bp.route('/memo', methods=['POST'])
def ai_memo():
    """从数据库读取预生成记忆素材，支持 ?style= 参数"""
    try:
        body = request.get_json(silent=True)
        if not body or 'word_id' not in body:
            return json_response(code=400, msg='缺少必填参数 word_id')

        word_id = body.get('word_id')
        if not isinstance(word_id, int):
            try:
                word_id = int(word_id)
            except (ValueError, TypeError):
                return json_response(code=400, msg='word_id 必须为整数')

        style = _valid_style(body.get('style', 'simple'))

        word = _read_word_from_db(word_id, style)
        if not word:
            return json_response(code=404, msg=f'单词 ID {word_id} 不存在')

        word['style'] = style
        return json_response(data=word)

    except RuntimeError:
        return json_response(code=500, msg='数据库连接异常，请稍后重试')
    except Exception:
        return json_response(code=500, msg='获取记忆素材失败，请稍后重试')


# ==================== 路由：生成素材（读数据库预生成内容） ====================
@ai_api_bp.route('/generate', methods=['POST'])
def generate_word_memo():
    """
    读取数据库中预生成的单词记忆素材（纯本地，无需调用大模型）
    入参：word_id(必填) + style(可选，返回对应风格)
    """
    try:
        body = request.get_json(silent=True)
        if not body or 'word_id' not in body:
            return json_response(code=400, msg='缺少必填参数 word_id')

        word_id = body.get('word_id')
        if not isinstance(word_id, int):
            try:
                word_id = int(word_id)
            except (ValueError, TypeError):
                return json_response(code=400, msg='word_id 必须为整数')

        style = _valid_style(body.get('style', 'simple'))

        word = _read_word_from_db(word_id, style)
        if not word:
            return json_response(code=404, msg=f'单词 ID {word_id} 不存在')

        word['style'] = style
        return json_response(data=word, msg='OK')

    except RuntimeError:
        return json_response(code=500, msg='数据库连接异常，请稍后重试')
    except Exception:
        return json_response(code=500, msg='获取记忆素材失败，请稍后重试')


def _valid_style(style):
    """校验并返回合法 style 值"""
    if style not in ('story', 'simple', 'mnemonic'):
        return 'simple'
    return style
