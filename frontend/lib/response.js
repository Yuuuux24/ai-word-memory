/**
 * 统一 JSON 响应：{ code, data, msg }
 */
function jsonResponse(res, code = 200, msg = 'success', data = null) {
  return res.status(code >= 200 && code < 600 ? code : 500).json({ code, data, msg });
}

export { jsonResponse };
