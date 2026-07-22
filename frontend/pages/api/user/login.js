/**
 * POST /api/user/login — 用户登录
 */
import { getSupabase } from '../../../lib/supabase';
import { createToken } from '../../../lib/jwt';
import { verifyPassword } from '../../../lib/password';
import { jsonResponse } from '../../../lib/response';

export default async (req, res) => {
  if (req.method !== 'POST') {
    return jsonResponse(res, 405, 'Method Not Allowed');
  }

  try {
    const { username: rawUser, password: rawPass } = req.body || {};
    const username = (rawUser || '').trim();
    const password = (rawPass || '').trim();

    if (!username) return jsonResponse(res, 400, '用户名不能为空');
    if (!password) return jsonResponse(res, 400, '密码不能为空');

    const supabase = getSupabase();
    const result = await supabase.from('users').select('*').eq('username', username);

    if (!result.data || result.data.length === 0) {
      return jsonResponse(res, 401, '用户名不存在，请先注册');
    }

    const user = result.data[0];
    const storedHash = user.password_hash || '';

    if (!storedHash || !verifyPassword(password, storedHash)) {
      return jsonResponse(res, 401, '密码错误');
    }

    const token = createToken(user.id, user.username);
    return jsonResponse(res, 200, '登录成功', {
      id: user.id,
      username: user.username,
      token,
      created_at: user.created_at,
    });
  } catch (e) {
    console.error('User login failed:', e);
    return jsonResponse(res, 500, '登录失败，请稍后重试');
  }
};
