/**
 * GET /api/user/me — 获取当前登录用户信息（需 JWT 鉴权）
 */
import { jwtRequired } from '../../../lib/jwt';
import { jsonResponse } from '../../../lib/response';

export default jwtRequired(async (req, res) => {
  return jsonResponse(res, 200, 'success', {
    user_id: req.userId,
    username: req.username,
  });
});
