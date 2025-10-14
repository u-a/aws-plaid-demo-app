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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 992);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  useEffect(() => {
    const checkMobile = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < 992);
      console.log('Window width:', width, 'isMobile:', width < 992);
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

  console.log('Layout rendering - isMobile:', isMobile, 'width:', windowWidth, 'route:', route);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      minHeight: '100vh',
      margin: 0,
      padding: 0
    }}>
      {/* Debug indicator - Remove this after testing */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: 'red',
        color: 'white',
        padding: '10px',
        zIndex: 9999,
        fontSize: '12px',
        borderRadius: '4px'
      }}>
        Width: {windowWidth}px | Mobile: {isMobile ? 'YES' : 'NO'}
      </div>

      {/* Mobile Header - ALWAYS show when isMobile is true */}
      <div
        style={{
          display: isMobile ? 'flex' : 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          padding: '0 1rem',
          backgroundColor: '#2c3e50',
          borderBottom: '2px solid #34495e',
          zIndex: 1000,
          justifyContent: 'space-between',
          alignItems: 'center',
          boxSizing: 'border-box'
        }}
      >
        <h4 style={{ margin: 0, fontSize: '18px', color: '#ffffff' }}>Financial Dashboard</h4>
        <button
          onClick={() => {
            console.log('Hamburger clicked! Current state:', isSidebarOpen);
            setIsSidebarOpen(!isSidebarOpen);
          }}
          style={{
            backgroundColor: '#3498db',
            border: '2px solid #2980b9',
            fontSize: '24px',
            color: '#ffffff',
            cursor: 'pointer',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '44px',
            minHeight: '44px',
            borderRadius: '4px'
          }}
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar */}
      <div
        style={{
          width: '280px',
          height: isMobile ? 'calc(100vh - 56px)' : '100vh',
          padding: '1.5rem',
          backgroundColor: '#f5f5f5',
          borderRight: '1px solid #ddd',
          overflowY: 'auto',
          position: isMobile ? 'fixed' : 'sticky',
          top: isMobile ? '56px' : '0',
          left: '0',
          zIndex: 999,
          display: isMobile && !isSidebarOpen ? 'none' : 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box'
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

      {/* Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            right: '0',
            bottom: '0',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 998
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
          padding: '1.5rem',
          boxSizing: 'border-box'
        }}
      >
        <Outlet />
      </div>
    </div>
  );
}