import { useState, useEffect, useCallback } from 'react';
import { Card, Input, Button, Typography, Space } from 'antd';
import { UserOutlined, LoginOutlined, LockOutlined, CheckCircleFilled, UserAddOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { showError, showSuccess, showWarning } from '@/utils/errorHandler';

const { Title, Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  useEffect(() => {
    const savedUserId = localStorage.getItem('user_id');
    const savedUsername = localStorage.getItem('username');
    if (savedUserId && savedUsername) {
      setUsername(savedUsername);
      setLoggedIn(true);
    }
  }, []);

  const handleUsernameChange = useCallback((e) => {
    setUsername(e.target.value);
  }, []);

  const handlePasswordChange = useCallback((e) => {
    setPassword(e.target.value);
  }, []);

  const handleSubmit = useCallback(async () => {
    const trimmedUser = username.trim();
    const trimmedPwd = password.trim();

    if (!trimmedUser) {
      showWarning('请输入用户名');
      return;
    }
    if (trimmedUser.length < 2) {
      showWarning('用户名至少需要 2 个字符');
      return;
    }
    if (!trimmedPwd) {
      showWarning('请输入密码');
      return;
    }
    if (trimmedPwd.length < 4) {
      showWarning('密码至少需要 4 个字符');
      return;
    }

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
        localStorage.setItem('user_id', json.data.id);
        localStorage.setItem('username', trimmedUser);
        showSuccess(json.msg || (isRegister ? '注册成功' : '登录成功'));
        setLoggedIn(true);
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
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setUsername('');
    setPassword('');
    setLoggedIn(false);
    showWarning('已退出登录');
  }, []);

  const handleSwitchMode = useCallback(() => {
    setIsRegister(prev => !prev);
    setPassword('');
  }, []);

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: isRegister
            ? 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)'
            : 'linear-gradient(135deg, #6c7cfc 0%, #8b98ff 100%)',
          margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isRegister
            ? <UserAddOutlined style={{ fontSize: 28, color: '#fff' }} />
            : <UserOutlined style={{ fontSize: 28, color: '#fff' }} />
          }
        </div>
        <Title level={3} style={{ marginBottom: 2 }}>
          {isRegister ? '用户注册' : '用户登录'}
        </Title>
        <Text type="secondary" style={{ fontSize: 14 }}>
          {isRegister ? '创建新账户，开始你的单词学习之旅' : '使用已有账户登录'}
        </Text>
      </div>

      <Card style={{ borderRadius: 14, border: '1px solid #f0f0f0' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>

          {loggedIn ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                padding: '12px 16px',
                background: 'linear-gradient(135deg, #f6ffed 0%, #f0fff0 100%)',
                borderRadius: 10, border: '1px solid #d9f7be',
                marginBottom: 16, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8,
              }}>
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 18 }} />
                <Text strong style={{ color: '#389e0d' }}>已登录：{localStorage.getItem('username')}</Text>
              </div>
              <Space>
                <Button danger onClick={handleLogout}>退出登录</Button>
                <Button type="primary" onClick={() => router.push('/')}>进入首页</Button>
              </Space>
            </div>
          ) : (
            <>
              {/* 用户名 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>用户名</Text>
                <Input
                  size="large"
                  placeholder="请输入用户名（至少 2 个字符）"
                  prefix={<UserOutlined style={{ color: '#b0b0b0' }} />}
                  value={username}
                  onChange={handleUsernameChange}
                  onPressEnter={handleSubmit}
                  maxLength={50}
                  style={{ borderRadius: 10 }}
                />
              </div>

              {/* 密码 */}
              <div>
                <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>密码</Text>
                <Input.Password
                  size="large"
                  placeholder="请输入密码（至少 4 个字符）"
                  prefix={<LockOutlined style={{ color: '#b0b0b0' }} />}
                  value={password}
                  onChange={handlePasswordChange}
                  onPressEnter={handleSubmit}
                  maxLength={50}
                  style={{ borderRadius: 10 }}
                />
              </div>

              {/* 提交按钮 */}
              <Button
                type="primary"
                size="large"
                block
                icon={isRegister ? <UserAddOutlined /> : <LoginOutlined />}
                loading={loading}
                onClick={handleSubmit}
                style={{ borderRadius: 10, height: 44 }}
              >
                {loading ? (isRegister ? '注册中...' : '登录中...') : (isRegister ? '注册' : '登录')}
              </Button>

              {/* 切换登录/注册 */}
              <div style={{ textAlign: 'center', marginTop: -4 }}>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {isRegister ? '已有账户？' : '还没有账户？'}
                </Text>
                <Button type="link" onClick={handleSwitchMode} style={{ fontSize: 13, padding: '0 4px' }}>
                  {isRegister ? '去登录' : '去注册'}
                </Button>
              </div>
            </>
          )}
        </Space>
      </Card>
    </div>
  );
}
