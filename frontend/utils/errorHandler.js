import { message } from 'antd';

/**
 * 统一错误提示处理 — 所有接口异常统一通过此方法弹窗展示
 */
const FALLBACK_MSG = '操作失败，请稍后重试';
const NETWORK_MSG = '无法连接后端服务，请确认 Flask 已启动';

export function showError(err, fallbackMsg = FALLBACK_MSG) {
  if (typeof err === 'string') {
    message.error(err);
    return;
  }
  if (err?.msg) {
    message.error(err.msg);
    return;
  }
  if (err?.message) {
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
      message.error(NETWORK_MSG);
      return;
    }
    message.error(err.message);
    return;
  }
  message.error(fallbackMsg);
  console.error('[ErrorHandler]', err);
}

export function showSuccess(msg = '操作成功') {
  message.success(msg);
}

export function showWarning(msg) {
  message.warning(msg);
}

export function showInfo(msg) {
  message.info(msg);
}
