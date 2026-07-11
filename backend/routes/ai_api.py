"""
AI 交互接口路由
- 后续在此实现 AI 智能测试、单词生成等接口
"""
from flask import Blueprint, jsonify

# 创建蓝图，URL 前缀为 /api/ai
ai_api_bp = Blueprint('ai_api', __name__, url_prefix='/api/ai')


@ai_api_bp.route('/hello', methods=['GET'])
def ai_api_hello():
    """预留：AI 模块测试接口"""
    return jsonify({'message': 'AI API module ready', 'code': 200})
