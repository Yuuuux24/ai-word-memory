"""
AI 记忆素材路由
- POST /api/ai/memo      从数据库读取预生成记忆素材（实际调用 generate_word_memo）
- POST /api/ai/generate   从数据库读取预生成素材（按 style 返回不同风格，纯本地，零API费用）

缓存策略：相同 word_id + style 组合命中内存缓存，5 分钟 TTL
"""
import json as _json
import logging
from flask import Blueprint, request

from supabase_client import get_supabase
from utils.response import json_response
from utils.auth import optional_auth
from cachetools import TTLCache

logger = logging.getLogger(__name__)

# 创建蓝图，URL 前缀为 /api/ai
ai_api_bp = Blueprint('ai_api', __name__, url_prefix='/api/ai')

# 内存缓存：相同 word_id + style 复用在 5 分钟内命中
_memo_cache = TTLCache(maxsize=500, ttl=300)

# 风格的备选 key 顺序（数据库 mnemonic JSON 可能只有一种 key，逐级兜底）
STYLE_FALLBACK = {
    'simple':   ['simple', 'story', 'mnemonic'],
    'story':    ['story', 'mnemonic', 'simple'],
    'mnemonic': ['mnemonic', 'simple', 'story'],
}


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

    # 检查缓存：相同 word_id + style 命中
    cache_key = f"{word_id}:{style}"
    if cache_key in _memo_cache:
        cached = dict(_memo_cache[cache_key])
        cached['from_cache'] = True
        return cached

    # 构建素材
    memo_data = {
        'word_id': word_id,
        'word': word['word'],
        'root': word.get('root_analysis') or word['word'],
        'mnemonic': _parse_mnemonic(word.get('mnemonic'), word['word'], style),
        'examples': [word.get('extra_example') or f"I find the word '{word['word']}' very useful."],
        'from_cache': False,
    }

    # 写入缓存
    _memo_cache[cache_key] = memo_data
    return memo_data


# ==================== 核心逻辑（两个路由复用） ====================
def _fetch_memo_from_db():
    """
    从数据库读取预生成记忆素材（纯本地，无需调用大模型）
    入参：word_id(必填) + style(可选，返回对应风格)
    返回 Flask Response
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
        return json_response(data=word)

    except RuntimeError:
        logger.error('Database connection error in _fetch_memo_from_db')
        return json_response(code=500, msg='数据库连接异常，请稍后重试')
    except Exception:
        logger.exception('Unexpected error in _fetch_memo_from_db')
        return json_response(code=500, msg='获取记忆素材失败，请稍后重试')


@ai_api_bp.route('/memo', methods=['POST'])
@optional_auth
def ai_memo():
    """从数据库读取预生成记忆素材（兼容旧接口，实际调用 /generate 相同逻辑）"""
    return _fetch_memo_from_db()


@ai_api_bp.route('/generate', methods=['POST'])
@optional_auth
def generate_word_memo():
    """读取数据库中预生成的单词记忆素材（纯本地，无需调用大模型）"""
    return _fetch_memo_from_db()


def _valid_style(style):
    """校验并返回合法 style 值"""
    if style not in ('story', 'simple', 'mnemonic'):
        return 'simple'
    return style
