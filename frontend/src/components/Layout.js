import React, { useState } from 'react';
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
    <Flex direction={{ base: 'column', medium: 'row' }}>
      {/* Mobile Header */}
      <View
        display={{ base: 'block', medium: 'none' }}
        padding="1rem"
        backgroundColor="var(--amplify-colors-background-secondary)"
        height="56px"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          borderBottom: '1px solid var(--amplify-colors-border-secondary)'
        }}
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Heading level={4}>Financial Dashboard</Heading>
          <Button
            variation="link"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Icon fontSize="1.5rem">{isSidebarOpen ? 'close' : 'menu'}</Icon>
          </Button>
        </Flex>
      </View>

      {/* Sidebar */}
      <View
        width={{ base: '280px', medium: '280px' }}
        height={{ base: 'calc(100vh - 56px)', medium: '100vh' }}
        padding="1.5rem"
        backgroundColor="var(--amplify-colors-background-secondary)"
        position={{ base: 'fixed', medium: 'sticky' }}
        top={{ base: '56px', medium: '0' }}
        left="0"
        display={{ base: isSidebarOpen ? 'block' : 'none', medium: 'block' }}
        style={{
          zIndex: 99,
          borderRight: '1px solid var(--amplify-colors-border-secondary)',
          overflowY: 'auto'
        }}
      >
        <Flex direction="column" height="100%">
          <Heading level={4} display={{ base: 'none', medium: 'block' }}>
            Financial Dashboard
          </Heading>
          
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
      </View>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <View
          display={{ base: 'block', medium: 'none' }}
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          backgroundColor="rgba(0,0,0,0.3)"
          zIndex="98"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <View
        flex="1"
        backgroundColor="white"
        marginTop={{ base: '56px', medium: '0' }}
        minHeight="100vh"
        position="relative"
        maxWidth={{ medium: 'calc(100% - 280px)' }}
      >
        <Outlet />
      </View>
    </Flex>
  );
}