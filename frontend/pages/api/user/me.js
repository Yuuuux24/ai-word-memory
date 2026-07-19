/**
 * GET /api/user/me — 获取当前登录用户信息（需 JWT 鉴权）
 */
const { jwtRequired } = require('../../../lib/jwt');
const { jsonResponse } = require('../../../lib/response');

export default jwtRequired(async (req, res) => {
  return jsonResponse(res, 200, 'success', {
    user_id: req.userId,
    username: req.username,
  });
});
