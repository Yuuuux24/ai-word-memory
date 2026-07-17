import { Layout as AntLayout, Menu, Button, Drawer, Grid } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useRouter } from 'next/router';
import { useState } from 'react';

const { Header, Content } = AntLayout;
const { useBreakpoint } = Grid;

const menuItems = [
  { key: '/', label: '单词首页' },
  { key: '/practice', label: '单词闯关' },
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

  return (
    <AntLayout style={{ minHeight: '100vh', background: 'transparent' }}>
      {/* 顶部导航栏 */}
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isMobile ? '0 16px' : '0 28px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 40%, #818cf8 100%)',
          boxShadow: '0 2px 16px rgba(79, 70, 229, 0.2)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          height: 56,
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Logo */}
        <div
          style={{
            color: '#fff',
            fontSize: isMobile ? 16 : 18,
            fontWeight: 700,
            whiteSpace: 'nowrap',
            letterSpacing: 0.5,
            cursor: 'pointer',
            userSelect: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
          onClick={() => router.push('/')}
        >
          <span style={{
            display: 'inline-flex',
            width: 28, height: 28,
            borderRadius: 7,
            background: 'rgba(255,255,255,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 15,
            fontWeight: 700,
          }}>
            AI
          </span>
          AI 单词记忆
        </div>

        {/* 导航菜单 */}
        {isMobile ? (
          <>
            <Button
              type="text"
              icon={<MenuOutlined style={{ color: '#fff', fontSize: 20 }} />}
              onClick={() => setDrawerOpen(true)}
              style={{ borderRadius: 8 }}
            />
            <Drawer
              title={<span style={{ fontWeight: 600, fontSize: 16 }}>导航菜单</span>}
              placement="right"
              onClose={() => setDrawerOpen(false)}
              open={drawerOpen}
              width={220}
              styles={{ body: { padding: 0 } }}
            >
              <Menu
                mode="vertical"
                selectedKeys={[router.pathname]}
                items={menuItems}
                onClick={handleMenuClick}
                style={{ border: 'none', padding: '8px 0' }}
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
              fontWeight: 500,
            }}
          />
        )}
      </Header>

      {/* 内容区域 */}
      <Content style={{
        padding: isMobile ? '12px' : '24px',
        maxWidth: 1200,
        margin: '0 auto',
        width: '100%',
      }}>
        <div
          style={{
            background: 'rgba(255,255,255,0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            padding: isMobile ? 18 : 28,
            borderRadius: 16,
            minHeight: 'calc(100vh - 112px)',
            boxShadow: '0 1px 3px rgba(99,102,241,0.04), 0 4px 16px rgba(99,102,241,0.06)',
            transition: 'all var(--transition-normal)',
          }}
        >
          {children}
        </div>
      </Content>
    </AntLayout>
  );
}
