import { message } from 'antd';

/**
 * 统一错误提示处理
 * 所有接口异常统一通过此方法弹窗展示
 */
export function showError(err, fallbackMsg = '操作失败') {
  // 已存在 Ant Design message 提示则不再重复
  if (typeof err === 'string') {
    message.error(err);
    return;
  }
  if (err?.msg) {
    message.error(err.msg);
    return;
  }
  if (err?.message) {
    message.error(err.message);
    return;
  }
  message.error(fallbackMsg);
  console.error('[ErrorHandler]', err);
}

/**
 * 统一成功提示
 */
export function showSuccess(msg = '操作成功') {
  message.success(msg);
}

/**
 * 统一警告提示
 */
export function showWarning(msg) {
  message.warning(msg);
}
