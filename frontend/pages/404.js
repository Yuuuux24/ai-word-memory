import { Button, Typography } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';

const { Title, Text } = Typography;

export default function Custom404() {
  const router = useRouter();

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
      <div style={{
        fontSize: 80,
        fontWeight: 'bold',
        background: 'linear-gradient(135deg, #4a54c9 0%, #8b98ff 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        lineHeight: 1.2,
      }}>
        404
      </div>
      <Title level={3} style={{ color: '#555', margin: '16px 0 8px' }}>页面未找到</Title>
      <Text type="secondary" style={{ fontSize: 15, display: 'block', marginBottom: 28 }}>
        您访问的页面不存在或已被移除
      </Text>
      <Button type="primary" icon={<HomeOutlined />} size="large" onClick={() => router.push('/')} style={{ borderRadius: 8 }}>
        返回首页
      </Button>
    </div>
  );
}
