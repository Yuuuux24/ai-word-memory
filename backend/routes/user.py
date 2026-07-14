"""
用户注册/登录接口路由
- POST /api/user/register  用户注册（需用户名+密码）
- POST /api/user/login     用户登录（需用户名+密码）
"""
from flask import Blueprint, jsonify, request
from werkzeug.security import generate_password_hash, check_password_hash
from supabase_client import get_supabase

user_bp = Blueprint('user', __name__, url_prefix='/api/user')


def json_response(code=200, data=None, msg='success'):
    """统一 JSON 返回结构"""
    return jsonify({'code': code, 'data': data, 'msg': msg})


@user_bp.route('/register', methods=['POST'])
def register():
    """
    用户注册
    入参：{ "username": "xxx", "password": "xxx" }
    逻辑：
      - username / password 非空校验
      - 检查用户名是否已存在
      - 密码哈希后写入数据库
    返回：用户 id、username、created_at
    """
    try:
        body = request.get_json(silent=True)
        if not body:
            return json_response(code=400, msg='缺少请求参数')

        username = (body.get('username') or '').strip()
        password = (body.get('password') or '').strip()

        if not username:
            return json_response(code=400, msg='用户名不能为空')
        if not password:
            return json_response(code=400, msg='密码不能为空')
        if len(username) < 2:
            return json_response(code=400, msg='用户名至少需要 2 个字符')
        if len(username) > 100:
            return json_response(code=400, msg='用户名不能超过100个字符')
        if len(password) < 4:
            return json_response(code=400, msg='密码至少需要 4 个字符')

        supabase = get_supabase()

        # 检查用户名是否已占用
        exists = supabase.table('users').select('id').eq('username', username).execute()
        if exists.data and len(exists.data) > 0:
            return json_response(code=409, msg='用户名已被注册')

        # 注册新用户
        password_hash = generate_password_hash(password)
        insert_result = supabase.table('users').insert({
            'username': username,
            'password_hash': password_hash,
        }).execute()

        if not insert_result.data:
            return json_response(code=500, msg='注册失败，请稍后重试')

        new_user = insert_result.data[0]
        return json_response(data={
            'id': new_user['id'],
            'username': new_user['username'],
            'created_at': new_user.get('created_at')
        }, msg='注册成功，欢迎使用')

    except Exception as e:
        err_msg = str(e)
        if 'duplicate' in err_msg.lower() or 'unique' in err_msg.lower():
            return json_response(code=409, msg='用户名已被注册')
        return json_response(code=500, msg='注册失败，请稍后重试')


@user_bp.route('/login', methods=['POST'])
def login():
    """
    用户登录
    入参：{ "username": "xxx", "password": "xxx" }
    逻辑：
      - username / password 非空校验
      - 查询用户是否存在
      - 验证密码
    返回：用户 id、username、created_at
    """
    try:
        body = request.get_json(silent=True)
        if not body:
            return json_response(code=400, msg='缺少请求参数')

        username = (body.get('username') or '').strip()
        password = (body.get('password') or '').strip()

        if not username:
            return json_response(code=400, msg='用户名不能为空')
        if not password:
            return json_response(code=400, msg='密码不能为空')

        supabase = get_supabase()

        result = supabase.table('users').select('*').eq('username', username).execute()

        if not result.data or len(result.data) == 0:
            return json_response(code=401, msg='用户名不存在，请先注册')

        user = result.data[0]

        # 验证密码
        stored_hash = user.get('password_hash', '')
        if not stored_hash or not check_password_hash(stored_hash, password):
            return json_response(code=401, msg='密码错误')

        return json_response(data={
            'id': user['id'],
            'username': user['username'],
            'created_at': user.get('created_at')
        }, msg='登录成功')

    except Exception:
        return json_response(code=500, msg='登录失败，请稍后重试')
