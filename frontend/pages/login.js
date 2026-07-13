import { useState, useEffect } from 'react';
import { Card, Input, Button, Typography, message, Space } from 'antd';
import { UserOutlined, LoginOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Title, Text } = Typography;
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:5000';

export default function Login() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);

  // 检查是否已登录
  useEffect(() => {
    const savedUserId = localStorage.getItem('user_id');
    const savedUsername = localStorage.getItem('username');
    if (savedUserId && savedUsername) {
      setUsername(savedUsername);
    }
  }, []);

  const handleLogin = async () => {
    const trimmed = username.trim();
    if (!trimmed) {
      message.warning('请输入用户名');
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
        setTimeout(() => router.push('/'), 500);
      } else {
        message.error(json.msg || '登录失败');
      }
    } catch (err) {
      message.error('无法连接后端服务，请确认 Flask 已启动');
      console.error('login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    setUsername('');
    message.info('已退出登录');
  };

  const isLoggedIn = () => {
    return !!localStorage.getItem('user_id');
  };

  return (
    <div style={{ maxWidth: 480, margin: '60px auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 8 }}>
        用户登录
      </Title>
      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}>
        输入用户名即可登录或自动注册，无需密码
      </Text>

      <Card style={{ borderRadius: 12 }}>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Text strong style={{ display: 'block', marginBottom: 8 }}>用户名</Text>
            <Input
              size="large"
              placeholder="请输入用户名"
              prefix={<UserOutlined />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onPressEnter={handleLogin}
              maxLength={50}
              disabled={!!localStorage.getItem('user_id')}
            />
          </div>

          {isLoggedIn() ? (
            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Text type="success" strong>
                已登录：{localStorage.getItem('username')}
              </Text>
              <Button danger onClick={handleLogout}>退出登录</Button>
              <Button type="primary" onClick={() => router.push('/')}>
                进入首页
              </Button>
            </Space>
          ) : (
            <Button
              type="primary"
              size="large"
              block
              icon={<LoginOutlined />}
              loading={loading}
              onClick={handleLogin}
            >
              {loading ? '登录中...' : '登 录 / 注 册'}
            </Button>
          )}
        </Space>
      </Card>

      <Text type="secondary" style={{ display: 'block', textAlign: 'center', marginTop: 24 }}>
        首次输入用户名将自动创建账户，学习记录仅属于你
      </Text>
    </div>
  );
}
