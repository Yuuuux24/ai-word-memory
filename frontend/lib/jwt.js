/**
 * JWT 工具 - 服务端鉴权
 */
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret';

function createToken(userId, username) {
  return jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: '7d' });
}

function extractPayload(req) {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch {
      return null;
    }
  }
  return null;
}

function optionalAuth(handler) {
  return async (req, res) => {
    const payload = extractPayload(req);
    req.userId = payload && payload.userId || null;
    req.username = payload && payload.username || null;
    return handler(req, res);
  };
}

function jwtRequired(handler) {
  return async (req, res) => {
    const payload = extractPayload(req);
    if (!payload) {
      return res.status(401).json({ code: 401, msg: '请先登录', data: null });
    }
    req.userId = payload.userId || null;
    req.username = payload.username || null;
    return handler(req, res);
  };
}

export { createToken, optionalAuth, jwtRequired };
