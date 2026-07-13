import { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, message, Space, Alert } from 'antd';
import { UserOutlined, LoginOutlined, CheckCircleFilled } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { showError } from '@/utils/errorHandler';

const { Title, Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [validationMsg, setValidationMsg] = useState('');

  // 检查是否已登录
  useEffect(() => {
    const savedUserId = localStorage.getItem('user_id');
    const savedUsername = localStorage.getItem('username');
    if (savedUserId && savedUsername) {
      setUsername(savedUsername);
      setLoggedIn(true);
    }
  }, []);

  // 实时校验用户名长度
  const handleUsernameChange = (e) => {
    const value = e.target.value;
    setUsername(value);
    const trimmed = value.trim();
    if (trimmed && trimmed.length < 2) {
      setValidationMsg('用户名至少需要 2 个字符');
    } else if (trimmed.length > 50) {
      setValidationMsg('用户名不能超过 50 个字符');
    } else {
      setValidationMsg('');
    }
  };

  const handleLogin = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      message.warning('请输入用户名');
      return;
    }
    if (trimmed.length < 2) {
      message.warning('用户名至少需要 2 个字符');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: trimmed }),
      });
      const json = await res.json();

      if (json.code === 200 && json.data) {
        localStorage.setItem('user_id', json.data.id);
        localStorage.setItem('username', trimmed);
        message.success(json.msg || '登录成功');
        setLoggedIn(true);
        setTimeout(() => router.push('/'), 800);
      } else {
        showError(json.msg || '登录失败');
      }
    } catch (err) {
      showError(err, '无法连接后端服务');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setUsername('');
    setLoggedIn(false);
    message.info('已退出登录');
  };

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'linear-gradient(135deg, #6c7cfc 0%, #8b98ff 100%)',
            margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <UserOutlined style={{ fontSize: 28, color: '#fff' }} />
        </div>
        <Title level={3} style={{ marginBottom: 4 }}>用户登录</Title>
        <Text type="secondary">输入用户名即可登录或自动注册，无需密码</Text>
      </div>

      <Card style={{ borderRadius: 14, border: '1px solid #f0f0f0' }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8, fontSize: 14 }}>
              用户名
            </Text>
            <Input
              size="large"
              placeholder="请输入用户名（至少2个字符）"
              prefix={<UserOutlined style={{ color: '#b0b0b0' }} />}
              value={username}
              onChange={handleUsernameChange}
              onPressEnter={handleLogin}
              maxLength={50}
              disabled={loggedIn}
              style={{ borderRadius: 10 }}
              status={validationMsg ? 'error' : ''}
            />
            {validationMsg && (
              <Text type="danger" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                {validationMsg}
              </Text>
            )}
          </div>

          {loggedIn ? (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #f6ffed 0%, #f0fff0 100%)',
                  borderRadius: 10,
                  border: '1px solid #d9f7be',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <CheckCircleFilled style={{ color: '#52c41a', fontSize: 18 }} />
                <Text strong style={{ color: '#389e0d' }}>
                  已登录：{localStorage.getItem('username')}
                </Text>
              </div>
              <Space>
                <Button danger onClick={handleLogout}>退出登录</Button>
                <Button type="primary" onClick={() => router.push('/')}>
                  进入首页
                </Button>
              </Space>
            </div>
          ) : (
            <Button
              type="primary"
              size="large"
              block
              icon={<LoginOutlined />}
              loading={loading}
              onClick={handleLogin}
              disabled={!!validationMsg}
              style={{ borderRadius: 10, height: 44 }}
            >
              {loading ? '登录中...' : '登录 / 注册'}
            </Button>
          )}
        </Space>
      </Card>

      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 24, fontSize: 13 }}>
        首次输入用户名将自动创建账户，学习记录仅属于你
      </Text>
    </div>
  );
}
