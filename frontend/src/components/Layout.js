import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthenticator, Button, Heading, View, Flex, Text, Icon } from '@aws-amplify/ui-react';

export default function Layout() {
  const { route, signOut } = useAuthenticator((context) => [
    context.route,
    context.signOut
  ]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Use 992px to match Amplify's 'large' breakpoint
  // This ensures consistency: mobile menu shows when < 992px
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 992);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  function logOut() {
    signOut();
    navigate('/login');
  }

  const navItems = [
    { name: 'Overview', path: '/', icon: 'home' },
    { name: 'Accounts', path: '/accounts', icon: 'account_balance' },
    { name: 'Transactions', path: '/transactions', icon: 'receipt' },
    { name: 'Settings', path: '/settings', icon: 'settings' }
  ];

  if (route !== 'authenticated') {
    return <Outlet />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh' }}>
      {/* Mobile Header - Only show on mobile */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '56px',
            padding: '1rem',
            backgroundColor: 'var(--amplify-colors-background-secondary)',
            borderBottom: '1px solid var(--amplify-colors-border-secondary)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Heading level={4} margin={0}>Financial Dashboard</Heading>
          <Button
            variation="link"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              padding: '0.5rem',
              color: 'var(--amplify-colors-font-primary)',
              backgroundColor: 'transparent'
            }}
          >
            <Icon fontSize="1.5rem">{isSidebarOpen ? 'close' : 'menu'}</Icon>
          </Button>
        </div>
      )}

      {/* Sidebar - Always rendered, visibility controlled */}
      <div
        style={{
          width: '280px',
          height: isMobile ? 'calc(100vh - 56px)' : '100vh',
          padding: '1.5rem',
          backgroundColor: 'var(--amplify-colors-background-secondary)',
          borderRight: '1px solid var(--amplify-colors-border-secondary)',
          overflowY: 'auto',
          position: isMobile ? 'fixed' : 'sticky',
          top: isMobile ? '56px' : '0',
          left: '0',
          zIndex: 99,
          display: isMobile && !isSidebarOpen ? 'none' : 'flex',
          flexDirection: 'column'
        }}
      >
        <Flex direction="column" height="100%">
          {!isMobile && (
            <Heading level={4}>
              Financial Dashboard
            </Heading>
          )}
          
          <Flex direction="column" gap="0.5rem" marginTop="2rem">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variation="text"
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                style={{
                  justifyContent: 'flex-start',
                  backgroundColor: location.pathname === item.path 
                    ? 'var(--amplify-colors-background-tertiary)' 
                    : 'transparent',
                  padding: '0.75rem',
                  width: '100%',
                  minHeight: '44px'
                }}
              >
                <Flex gap="0.5rem" alignItems="center" width="100%">
                  <Icon fontSize="1.2rem" flexShrink={0}>{item.icon}</Icon>
                  <Text style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>{item.name}</Text>
                </Flex>
              </Button>
            ))}
          </Flex>

          <Button
            variation="link"
            onClick={logOut}
            style={{
              justifyContent: 'flex-start',
              marginTop: 'auto',
              padding: '0.75rem'
            }}
          >
            <Flex gap="0.5rem" alignItems="center">
              <Icon fontSize="1.2rem">logout</Icon>
              <Text>Sign Out</Text>
            </Flex>
          </Button>
        </Flex>
      </div>

      {/* Mobile Overlay - Only show on mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.3)',
            zIndex: 98
          }}
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          backgroundColor: 'white',
          marginTop: isMobile ? '56px' : '0',
          minHeight: '100vh',
          position: 'relative',
          maxWidth: isMobile ? '100%' : 'calc(100% - 280px)',
          padding: '1.5rem'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}