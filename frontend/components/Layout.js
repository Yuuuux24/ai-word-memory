import { Layout as AntLayout, Menu } from 'antd';
import { useRouter } from 'next/router';

const { Header, Content } = AntLayout;

const menuItems = [
  { key: '/', label: '单词首页' },
  { key: '/history', label: '背诵历史' },
  { key: '/login', label: '用户登录' },
];

export default function Layout({ children }) {
  const router = useRouter();

  const handleMenuClick = (e) => {
    router.push(e.key);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', padding: '0 24px' }}>
        <div style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginRight: 40, whiteSpace: 'nowrap' }}>
          AI 单词记忆
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          selectedKeys={[router.pathname]}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Header>
      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
          {children}
        </div>
      </Content>
    </AntLayout>
  );
}
