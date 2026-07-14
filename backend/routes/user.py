"""
用户注册/登录接口路由
- POST /api/user/login  根据用户名登录，不存在则自动注册
"""
from flask import Blueprint, jsonify, request
from supabase_client import get_supabase

user_bp = Blueprint('user', __name__, url_prefix='/api/user')


def json_response(code=200, data=None, msg='success'):
    """统一 JSON 返回结构"""
    return jsonify({'code': code, 'data': data, 'msg': msg})


@user_bp.route('/login', methods=['POST'])
def login():
    """
    用户登录（自动注册）
    入参：{ "username": "xxx" }
    逻辑：
      - username 非空校验
      - 查询 users 表是否存在该用户名
      - 不存在 → 插入新用户记录（自动生成临时邮箱）
      - 存在 → 直接返回用户信息
    返回：用户 id、username、created_at
    """
    try:
        body = request.get_json(silent=True)
        if not body or 'username' not in body:
            return json_response(code=400, msg='缺少必填参数 username')

        username = body.get('username', '').strip()
        if not username:
            return json_response(code=400, msg='用户名不能为空')
        if len(username) > 100:
            return json_response(code=400, msg='用户名不能超过100个字符')

        supabase = get_supabase()

        # 查询用户是否已存在
        result = supabase.table('users').select('*').eq('username', username).execute()

        if result.data and len(result.data) > 0:
            user = result.data[0]
            return json_response(data={
                'id': user['id'],
                'username': user['username'],
                'created_at': user.get('created_at')
            }, msg='登录成功（已有账户）')

        # 用户不存在，自动注册
        insert_result = supabase.table('users').insert({
            'username': username,
        }).execute()

        if not insert_result.data:
            return json_response(code=500, msg='用户注册失败，请稍后重试')

        new_user = insert_result.data[0]
        return json_response(data={
            'id': new_user['id'],
            'username': new_user['username'],
            'created_at': new_user.get('created_at')
        }, msg='注册成功，欢迎使用')

    except Exception as e:
        # 唯一键冲突时返回已有用户
        err_msg = str(e)
        if 'duplicate' in err_msg.lower() or 'unique' in err_msg.lower():
            try:
                result = get_supabase().table('users').select('*').eq('username', username).execute()
                if result.data:
                    user = result.data[0]
                    return json_response(data={
                        'id': user['id'],
                        'username': user['username'],
                        'created_at': user.get('created_at')
                    }, msg='登录成功')
            except Exception:
                pass
        return json_response(code=500, msg='登录失败，请稍后重试')
