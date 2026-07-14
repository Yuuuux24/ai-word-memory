import { Layout as AntLayout, Menu, Button, Drawer, Grid } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

const { Header, Content } = AntLayout;
const { useBreakpoint } = Grid;

const menuItems = [
  { key: '/', label: '单词首页' },
  { key: '/history', label: '背诵历史' },
  { key: '/login', label: '用户登录' },
];

export default function Layout({ children }) {
  const router = useRouter();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleMenuClick = (e) => {
    router.push(e.key);
    setDrawerOpen(false);
  };

  const currentLabel = menuItems.find((m) => m.key === router.pathname)?.label || '';

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'transparent' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: 'linear-gradient(135deg, #4a54c9 0%, #6c7cfc 100%)',
          boxShadow: '0 2px 12px rgba(74, 84, 201, 0.25)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 56,
        }}
      >
        <div
          style={{
            color: '#fff',
            fontSize: isMobile ? 16 : 18,
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            letterSpacing: 1,
          }}
        >
          AI 单词记忆
        </div>

        {isMobile ? (
          <>
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
            />
            <Drawer
              title="导航菜单"
              placement="right"
              onClose={() => setDrawerOpen(false)}
              open={drawerOpen}
              width={200}
              bodyStyle={{ padding: 0 }}
            >
              <Menu
                mode="vertical"
                selectedKeys={[router.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ border: 'none' }}
              />
            </Drawer>
          </>
        ) : (
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[router.pathname]}
            items={menuItems}
            onClick={handleMenuClick}
            style={{
              flex: 1,
              minWidth: 0,
              background: 'transparent',
              borderBottom: 'none',
              justifyContent: 'flex-end',
            }}
          />
        )}
      </Header>

      <Content style={{ padding: isMobile ? '12px' : '24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(10px)',
            padding: isMobile ? 18 : 28,
            borderRadius: 16,
            minHeight: 'calc(100vh - 112px)',
            boxShadow: '0 4px 20px rgba(108,124,252,0.06)',
          }}
        >
          {children}
        </div>
      </Content>
    </AntLayout>
  );
}
