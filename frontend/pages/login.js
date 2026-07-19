import { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Typography, Space } from 'antd';
import { UserOutlined, LoginOutlined, LockOutlined, CheckCircleFilled, UserAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { showError, showSuccess, showWarning } from '@/utils/errorHandler';
import { setAuthData, clearAuthData, getToken, getUsername } from '@/utils/auth';

const { Title, Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || '';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  // 表单校验状态
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    const token = getToken();
    const savedUsername = getUsername();
    if (token && savedUsername) {
      setUsername(savedUsername);
      setLoggedIn(true);
    }
  }, []);

  // 用户名实时校验
  const handleUsernameChange = useCallback((e) => {
    const val = e.target.value;
    setUsername(val);
    if (val.length > 0 && val.length < 2) {
      setUsernameError('用户名至少需要 2 个字符');
    } else {
      setUsernameError('');
    }
  }, []);

  // 密码实时校验
  const handlePasswordChange = useCallback((e) => {
    const val = e.target.value;
    setPassword(val);
    if (val.length > 0 && val.length < 4) {
      setPasswordError('密码至少需要 4 个字符');
    } else {
      setPasswordError('');
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmedUser = username.trim();
    const trimmedPwd = password.trim();

    let hasError = false;
    if (!trimmedUser) {
      showWarning('请输入用户名');
      setUsernameError('请输入用户名');
      hasError = true;
    }
    if (trimmedUser.length > 0 && trimmedUser.length < 2) {
      showWarning('用户名至少需要 2 个字符');
      setUsernameError('用户名至少需要 2 个字符');
      hasError = true;
    }
    if (!trimmedPwd) {
      showWarning('请输入密码');
      setPasswordError('请输入密码');
      hasError = true;
    }
    if (trimmedPwd.length > 0 && trimmedPwd.length < 4) {
      showWarning('密码至少需要 4 个字符');
      setPasswordError('密码至少需要 4 个字符');
      hasError = true;
    }
    if (hasError) return;

    setLoading(true);
    try {
      const url = isRegister
        ? `${API_BASE}/api/user/register`
        : `${API_BASE}/api/user/login`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmedUser, password: trimmedPwd }),
      });
      const json = await res.json();

      if (json.code === 200 && json.data) {
        setAuthData(json.data.token, json.data.id, trimmedUser);
        showSuccess(json.msg || (isRegister ? '注册成功' : '登录成功'));
        setLoggedIn(true);
        setUsernameError('');
        setPasswordError('');
        setTimeout(() => router.push('/'), 800);
      } else {
        showError(json.msg || '操作失败，请稍后重试');
      }
    } catch (err) {
      showError(err, '无法连接后端服务，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [username, password, isRegister, router]);

  const handleLogout = useCallback(() => {
    clearAuthData();
    setUsername('');
    setPassword('');
    setLoggedIn(false);
    setUsernameError('');
    setPasswordError('');
    showWarning('已退出登录');
  }, []);

  const handleSwitchMode = useCallback(() => {
    setIsRegister(prev => !prev);
    setPassword('');
    setUsernameError('');
    setPasswordError('');
  }, []);

  // 输入框状态 class
  const usernameWrapperClass = usernameError ? 'auth-input auth-input-error' : (username.length >= 2 ? 'auth-input auth-input-success' : 'auth-input');
  const passwordWrapperClass = passwordError ? 'auth-input auth-input-error' : (password.length >= 4 ? 'auth-input auth-input-success' : 'auth-input');

  return (
    <div style={{
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        {/* Logo / 标题区 */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 68, height: 68, borderRadius: '18px',
            background: isRegister
              ? 'linear-gradient(135deg, #10b981 0%, #34d399 100%)'
              : 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: isRegister
              ? '0 8px 24px rgba(16, 185, 129, 0.3)'
              : '0 8px 24px rgba(99, 102, 241, 0.3)',
          }}>
            {isRegister
              ? <UserAddOutlined style={{ fontSize: 30, color: '#fff' }} />
              : <UserOutlined style={{ fontSize: 30, color: '#fff' }} />
            }
          </div>
          <Title level={3} style={{ marginBottom: 4, fontWeight: 700, color: 'var(--text-primary)' }}>
            {isRegister ? '创建账户' : '欢迎回来'}
          </Title>
          <Text style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
            {isRegister ? '注册新账户，开始单词学习之旅' : '登录你的账户继续学习'}
          </Text>
        </div>

        {/* 登录卡片 */}
        <Card style={{
          borderRadius: 18,
          border: '1px solid var(--border-light)',
          boxShadow: '0 4px 24px rgba(99, 102, 241, 0.08), 0 1px 4px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>

            {loggedIn ? (
              /* 已登录状态 */
              <div style={{ textAlign: 'center', padding: '8px 0' }}>
                <div style={{
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                  borderRadius: 12,
                  border: '1px solid #a7f3d0',
                  marginBottom: 20,
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: 10,
                }}>
                  <CheckCircleFilled style={{ color: '#10b981', fontSize: 20 }} />
                  <Text strong style={{ color: '#065f46', fontSize: 15 }}>
                    已登录：{getUsername()}
                  </Text>
                </div>
                <Space size={12}>
                  <Button danger onClick={handleLogout} style={{ borderRadius: 10 }}>退出登录</Button>
                  <Button type="primary" onClick={() => router.push('/')} style={{ borderRadius: 10 }}>
                    进入首页
                  </Button>
                </Space>
              </div>
            ) : (
              <>
                {/* 用户名 */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 14, color: 'var(--text-primary)' }}>
                    用户名
                  </Text>
                  <div className={usernameWrapperClass}>
                    <Input
                      size="large"
                      placeholder="请输入用户名（至少 2 个字符）"
                      prefix={<UserOutlined style={{ color: 'var(--text-tertiary)' }} />}
                      value={username}
                      onChange={handleUsernameChange}
                      onPressEnter={handleSubmit}
                      maxLength={50}
                      status={usernameError ? 'error' : (username.length >= 2 ? '' : undefined)}
                    />
                  </div>
                  {usernameError && (
                    <Text style={{ fontSize: 12, color: 'var(--danger)', display: 'block', marginTop: 6, paddingLeft: 2 }}>
                      {usernameError}
                    </Text>
                  )}
                </div>

                {/* 密码 */}
                <div>
                  <Text strong style={{ display: 'block', marginBottom: 10, fontSize: 14, color: 'var(--text-primary)' }}>
                    密码
                  </Text>
                  <div className={passwordWrapperClass}>
                    <Input.Password
                      size="large"
                      placeholder="请输入密码（至少 4 个字符）"
                      prefix={<LockOutlined style={{ color: 'var(--text-tertiary)' }} />}
                      value={password}
                      onChange={handlePasswordChange}
                      onPressEnter={handleSubmit}
                      maxLength={50}
                      status={passwordError ? 'error' : (password.length >= 4 ? '' : undefined)}
                    />
                  </div>
                  {passwordError && (
                    <Text style={{ fontSize: 12, color: 'var(--danger)', display: 'block', marginTop: 6, paddingLeft: 2 }}>
                      {passwordError}
                    </Text>
                  )}
                </div>

                {/* 提交按钮 */}
                <Button
                  type="primary"
                  size="large"
                  block
                  icon={isRegister ? <UserAddOutlined /> : <LoginOutlined />}
                  loading={loading}
                  disabled={!username.trim() || !password.trim() || !!usernameError || !!passwordError}
                  onClick={handleSubmit}
                  style={{ borderRadius: 12, height: 48, fontSize: 15, fontWeight: 500 }}
                >
                  {loading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注册' : '登录')}
                </Button>

                {/* 切换登录/注册 */}
                <div style={{ textAlign: 'center', marginTop: -8 }}>
                  <Text style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                    {isRegister ? '已有账户？' : '还没有账户？'}
                  </Text>
                  <Button
                    type="link"
                    onClick={handleSwitchMode}
                    style={{ fontSize: 13, padding: '0 6px', fontWeight: 500, color: 'var(--primary)' }}
                  >
                    {isRegister ? '去登录' : '去注册'}
                  </Button>
                </div>
              </>
            )}
          </Space>
        </Card>
      </div>
    </div>
  );
}
