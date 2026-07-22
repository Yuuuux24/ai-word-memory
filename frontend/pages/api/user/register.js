/**
 * POST /api/user/register — 用户注册
 */
import { getSupabase } from '../../../lib/supabase';
import { createToken } from '../../../lib/jwt';
import { hashPassword } from '../../../lib/password';
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
    if (username.length < 2) return jsonResponse(res, 400, '用户名至少需要 2 个字符');
    if (username.length > 100) return jsonResponse(res, 400, '用户名不能超过100个字符');
    if (password.length < 4) return jsonResponse(res, 400, '密码至少需要 4 个字符');

    const supabase = getSupabase();

    // 检查用户名是否已占用
    const exists = await supabase.from('users').select('id').eq('username', username);
    if (exists.data && exists.data.length > 0) {
      return jsonResponse(res, 409, '用户名已被注册');
    }

    // 注册新用户
    const pwdHash = hashPassword(password);
    const insertRes = await supabase.from('users').insert({
      username,
      password_hash: pwdHash,
    }).select();

    if (!insertRes.data || insertRes.data.length === 0) {
      return jsonResponse(res, 500, '注册失败，请稍后重试');
    }

    const user = insertRes.data[0];
    const token = createToken(user.id, user.username);
    return jsonResponse(res, 200, '注册成功，欢迎使用', {
      id: user.id,
      username: user.username,
      token,
      created_at: user.created_at,
    });
  } catch (e) {
    const msg = String(e.message || e).toLowerCase();
    if (msg.includes('duplicate') || msg.includes('unique')) {
      return jsonResponse(res, 409, '用户名已被注册');
    }
    console.error('User registration failed:', e);
    return jsonResponse(res, 500, '注册失败，请稍后重试');
  }
};
