/**
 * 前端 JWT 认证工具
 * 统一管理 token 的存取和请求头生成
 */

const TOKEN_KEY = 'auth_token';
const USERNAME_KEY = 'username';
const USER_ID_KEY = 'user_id';

export function getToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthData(token, userId, username) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_ID_KEY, String(userId));
  localStorage.setItem(USERNAME_KEY, username);
}

export function clearAuthData() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_ID_KEY);
  localStorage.removeItem(USERNAME_KEY);
}

export function getUserId() {
  if (typeof window === 'undefined') return null;
  const uid = localStorage.getItem(USER_ID_KEY);
  return uid ? parseInt(uid, 10) : null;
}

export function getUsername() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(USERNAME_KEY);
}

export function isLoggedIn() {
  return !!getToken();
}

/** 生成带 Authorization header 的请求头 */
export function authHeaders(extraHeaders = {}) {
  const headers = { 'Content-Type': 'application/json', ...extraHeaders };
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

/** 带 JWT 鉴权的 fetch 封装 */
export async function authFetch(url, options = {}) {
  const token = getToken();
  const headers = { ...options.headers };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  return fetch(url, { ...options, headers });
}
