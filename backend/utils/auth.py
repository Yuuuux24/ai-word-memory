"""
JWT 鉴权工具
- create_token: 生成 JWT token
- decode_token: 解析验证 JWT token
- jwt_required: Flask 路由装饰器，校验 Authorization header
"""
import os
import jwt
import datetime
import functools
import logging
from flask import request, g

from utils.response import json_response

logger = logging.getLogger(__name__)

# JWT 密钥：优先从环境变量读取，否则使用默认值（生产环境务必配置环境变量）
JWT_SECRET = os.getenv('JWT_SECRET', 'ai-word-memory-dev-secret-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRES_HOURS = 168  # Token 有效期：7天


def create_token(user_id: int, username: str) -> str:
    """生成 JWT token"""
    payload = {
        'user_id': user_id,
        'username': username,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=JWT_EXPIRES_HOURS),
        'iat': datetime.datetime.now(datetime.timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def decode_token(token: str) -> dict | None:
    """解析 JWT token，成功返回 payload，失败返回 None"""
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        logger.warning('JWT token expired')
        return None
    except jwt.InvalidTokenError as e:
        logger.warning('Invalid JWT token: %s', e)
        return None


def jwt_required(f):
    """
    Flask 路由装饰器：校验 Authorization header 中的 Bearer token
    鉴权通过后会将 user_id 和 username 注入 flask.g
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if not auth_header.startswith('Bearer '):
            return json_response(code=401, msg='未提供有效的认证令牌')

        token = auth_header[7:]
        payload = decode_token(token)
        if payload is None:
            return json_response(code=401, msg='认证令牌无效或已过期')

        g.user_id = payload['user_id']
        g.username = payload['username']
        return f(*args, **kwargs)

    return decorated


def optional_auth(f):
    """
    可选鉴权装饰器：有 token 则解析，没有也能继续（用于公开接口）
    """
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header[7:]
            payload = decode_token(token)
            if payload:
                g.user_id = payload['user_id']
                g.username = payload['username']
        return f(*args, **kwargs)

    return decorated
