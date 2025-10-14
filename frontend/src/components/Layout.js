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
    <Flex direction={{ base: 'column', large: 'row' }}>
      {/* Mobile Header */}
      <View
        display={{ base: 'block', large: 'none' }}
        padding="1rem"
        backgroundColor="var(--amplify-colors-background-secondary)"
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
        width={{ base: '100%', large: '250px' }}
        height={{ base: 'auto', large: '100vh' }}
        padding="1.5rem"
        backgroundColor="var(--amplify-colors-background-secondary)"
        position={{ base: 'fixed', large: 'sticky' }}
        top="0"
        display={{ base: isSidebarOpen ? 'block' : 'none', large: 'block' }}
        style={{
          zIndex: 99,
          borderRight: '1px solid var(--amplify-colors-border-secondary)'
        }}
      >
        <Flex direction="column" height="100%">
          <Heading level={4} display={{ base: 'none', large: 'block' }}>
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
                  padding: '0.75rem'
                }}
              >
                <Flex gap="0.5rem" alignItems="center">
                  <Icon fontSize="1.2rem">{item.icon}</Icon>
                  <Text>{item.name}</Text>
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

      {/* Main Content */}
      <View
        flex="1"
        backgroundColor="white"
        marginTop={{ base: '56px', large: '0' }}
        minHeight="100vh"
      >
        <Outlet />
      </View>
    </Flex>
  );
}