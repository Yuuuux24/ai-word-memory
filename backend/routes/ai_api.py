"""
AI 交互接口路由
- POST /api/ai/memo   AI 生成单词趣味记忆口诀、词根解析、日常例句
"""
from flask import Blueprint, jsonify, request
from supabase_client import get_supabase
import random

# 创建蓝图，URL 前缀为 /api/ai
ai_api_bp = Blueprint('ai_api', __name__, url_prefix='/api/ai')


def json_response(code=200, data=None, msg='success'):
    """统一 JSON 返回结构"""
    return jsonify({'code': code, 'data': data, 'msg': msg})


def generate_memo(word, meaning, part_of_speech, example_sentence):
    """
    模拟 AI 生成单词趣味记忆素材
    后续可替换为真实 AI API 调用
    """
    # 词根词缀解析模板
    root_templates = {
        'abandon': 'a-（不） + bandon（掌控）→ 不再掌控 → 放弃',
        'brilliant': '源于法语 brillant，意为"闪耀的"',
        'curious': 'cur（关心）+ ious（形容词后缀）→ 关心的 → 好奇的',
        'diligent': 'di-（分开）+ lig（选择）+ ent → 精挑细选的 → 勤奋的',
        'embrace': 'em-（进入）+ brace（手臂）→ 进入怀抱 → 拥抱',
        'fragile': 'frag（打破）+ ile（易…的）→ 容易打破的 → 脆弱的',
        'generous': 'gener（产生）+ ous → 能不断产生的 → 慷慨的',
        'harvest': '源自古英语 hærfest，意为"秋天收获季节"',
        'inevitable': 'in-（不） + evit（避免）+ able → 不可避免的',
        'journey': '源自法语 journée，意为"一天的路程"',
    }

    # 趣味记忆口诀模板
    mnemonic_templates = [
        f"「{word}」记忆口诀：把单词拆成{word[:3]}... + {word[3:]}...，联想一个有趣的画面帮你记住它。",
        f"记「{word}」很简单：想象一下{meaning}的场景，这个单词就刻在脑海里啦！",
        f'「{word}」={meaning}，可以记成「遇到{word}就{meaning}」，朗朗上口！',
    ]

    # 日常例句扩展
    extra_examples = [
        f"I find the word '{word}' very useful in daily life.",
        f"Learning the word '{word}' helps me express '{meaning}' better.",
        f"When I think of '{word}', I always remember: {example_sentence}",
    ]

    memo_data = {
        'word_id': None,  # 由调用方设置
        'word': word,
        'root_analysis': root_templates.get(word, f'"{word}" 暂无词根解析，可尝试按音节拆解记忆。'),
        'mnemonic': random.choice(mnemonic_templates),
        'extra_example': random.choice(extra_examples),
        'part_of_speech': part_of_speech,
        'original_example': example_sentence,
    }

    return memo_data


@ai_api_bp.route('/memo', methods=['POST'])
def ai_memo():
    """
    AI 生成单词记忆素材
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

        # 从数据库查询单词
        supabase = get_supabase()
        result = supabase.table('words').select('*').eq('id', word_id).execute()

        if not result.data:
            return json_response(code=404, msg=f'单词 ID {word_id} 不存在')

        word = result.data[0]

        # 生成 AI 记忆素材（使用实际表列名 basic_meaning）
        memo_data = generate_memo(
            word=word['word'],
            meaning=word.get('basic_meaning', ''),
            part_of_speech='',
            example_sentence='',
        )
        memo_data['word_id'] = word_id

        return json_response(data=memo_data)

    except RuntimeError as e:
        # Supabase 连接异常
        return json_response(code=500, msg=f'数据库连接异常: {str(e)}')
    except Exception as e:
        return json_response(code=500, msg=f'生成AI记忆素材失败: {str(e)}')
