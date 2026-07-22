/**
 * 密码哈希工具 - 兼容 werkzeug.security 格式
 *
 * werkzeug 的历史哈希格式：
 *   - pbkdf2:sha256:260000$salt$hash  （werkzeug 2.x 默认）
 *   - scrypt:32768:8:1$salt$hash       （werkzeug 3.x 默认，hash 是 hex 编码）
 *
 * 新密码统一使用 pbkdf2:sha256:260000 格式，与 werkzeug 2.x 兼容。
 */
import crypto from 'crypto';

const PBKDF2_ITERATIONS = 260000;
const SALT_LENGTH = 16;
const KEY_LENGTH = 32; // 256 bits

/**
 * 验证旧格式密码
 */
function verifyWerkzeugHash(password, storedHash) {
  // pbkdf2:sha256:260000$salt$hash
  const pbkdf2Match = storedHash.match(/^pbkdf2:sha256:(\d+)\$(.+)\$(.+)$/);
  if (pbkdf2Match) {
    const iterations = parseInt(pbkdf2Match[1], 10);
    const salt = pbkdf2Match[2];
    const expectedHex = pbkdf2Match[3];
    const derived = crypto.pbkdf2Sync(password, salt, iterations, KEY_LENGTH, 'sha256');
    return derived.toString('hex') === expectedHex;
  }

  // scrypt:32768:8:1$salt$hash（werkzeug 3.x 默认）
  const scryptMatch = storedHash.match(/^scrypt:(\d+):(\d+):(\d+)\$(.+)\$(.+)$/);
  if (scryptMatch) {
    const N = parseInt(scryptMatch[1], 10);
    const r = parseInt(scryptMatch[2], 10);
    const p = parseInt(scryptMatch[3], 10);
    const salt = scryptMatch[4];
    const expectedHex = scryptMatch[5];
    const derived = crypto.scryptSync(password, salt, KEY_LENGTH, { N, r, p });
    return derived.toString('hex') === expectedHex;
  }

  return false;
}

/**
 * 验证密码（自动检测格式）
 */
function verifyPassword(password, storedHash) {
  if (!storedHash || !password) return false;
  return verifyWerkzeugHash(password, storedHash);
}

/**
 * 生成 pbkdf2:sha256 格式密码哈希（与 werkzeug 2.x 兼容）
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH).toString('ascii');
  const derived = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha256');
  return `pbkdf2:sha256:${PBKDF2_ITERATIONS}$${salt}$${derived.toString('hex')}`;
}

export { verifyPassword, hashPassword };
