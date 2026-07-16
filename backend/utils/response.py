"""
统一 JSON 响应工具
所有路由蓝图统一引用此模块，消除重复定义
"""
from flask import jsonify


def json_response(code=200, data=None, msg='success'):
    """统一 JSON 返回结构：{ code, data, msg }"""
    return jsonify({'code': code, 'data': data, 'msg': msg})
