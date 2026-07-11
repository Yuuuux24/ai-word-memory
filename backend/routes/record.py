"""
学习记录接口路由
- 后续在此实现学习记录 CRUD 业务逻辑
"""
from flask import Blueprint, jsonify

# 创建蓝图，URL 前缀为 /api/record
record_bp = Blueprint('record', __name__, url_prefix='/api/record')


@record_bp.route('/hello', methods=['GET'])
def record_hello():
    """预留：学习记录模块测试接口"""
    return jsonify({'message': 'Record module ready', 'code': 200})
