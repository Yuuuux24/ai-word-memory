"""
单词相关接口路由
- 后续在此实现单词 CRUD 业务逻辑
"""
from flask import Blueprint, jsonify

# 创建蓝图，URL 前缀为 /api/word
word_bp = Blueprint('word', __name__, url_prefix='/api/word')


@word_bp.route('/hello', methods=['GET'])
def word_hello():
    """预留：单词模块测试接口"""
    return jsonify({'message': 'Word module ready', 'code': 200})
