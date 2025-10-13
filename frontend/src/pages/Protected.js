import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { View, Heading, Flex, Text, Button, Icon } from '@aws-amplify/ui-react';
import { getItems as GetItems, getAccounts as GetAccounts } from '../graphql/queries';
import Plaid from '../components/Plaid';
import Institutions from '../components/Institutions';
import Summary from '../components/Summary';
import { useNavigate, useLocation } from 'react-router-dom';

const logger = new ConsoleLogger("Protected");

export default function Protected() {
  const [items, setItems] = useState([]);
  const [assets, setAssets] = useState(0);
  const [liabilities, setLiabilities] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const client = generateClient();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { name: 'Overview', path: '/', icon: 'home' },
    { name: 'Accounts', path: '/accounts', icon: 'account_balance' },
    { name: 'Transactions', path: '/transactions', icon: 'receipt' },
    { name: 'Settings', path: '/settings', icon: 'settings' }
  ];

  const getItemsAndAccounts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await client.graphql({
        query: GetItems
      });
      logger.info(res);
      const items = res.data.getItems.items;
      
      // Fetch accounts for each item
      const itemsWithAccounts = await Promise.all(items.map(async (item) => {
        const accountsRes = await client.graphql({
          query: GetAccounts,
          variables: { id: item.item_id }
        });
        return {
          ...item,
          accounts: accountsRes.data.getAccounts
        };
      }));
      
      setItems(itemsWithAccounts);

      let totalAssets = 0;
      let totalLiabilities = 0;

      itemsWithAccounts.forEach(item => {
        item.accounts.forEach(account => {
          const balance = parseFloat(account.balances?.current) || 0;
          const currency = account.balances?.iso_currency_code;

          if (!isNaN(balance) && currency === 'USD') {
            if (account.type === 'depository' || account.type === 'investment') {
              totalAssets += balance;
            }
            if (account.type === 'loan' || account.type === 'credit') {
              totalLiabilities += Math.abs(balance);
            }
          }
        });
      });

      setAssets(totalAssets);
      setLiabilities(totalLiabilities);
    } catch (err) {
      logger.error('unable to get items or accounts', err);
      setError('Failed to fetch financial data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getItemsAndAccounts();
  }, []);

  return (
    <Flex direction="row" minHeight="100vh">
      {/* Sidebar Navigation */}
      <View 
        width="250px" 
        padding="1.5rem"
        backgroundColor="var(--amplify-colors-background-secondary)"
        style={{ borderRight: '1px solid var(--amplify-colors-border-secondary)' }}
      >
        <Flex direction="column" gap="2rem">
          <Heading level={4}>Financial Dashboard</Heading>
          <Flex direction="column" gap="0.5rem">
            {navItems.map((item) => (
              <Button
                key={item.path}
                variation="text"
                onClick={() => navigate(item.path)}
                style={{
                  justifyContent: 'flex-start',
                  backgroundColor: location.pathname === item.path ? 'var(--amplify-colors-background-tertiary)' : 'transparent'
                }}
              >
                <Flex gap="0.5rem" alignItems="center">
                  <Icon fontSize="1.2rem">{item.icon}</Icon>
                  <Text>{item.name}</Text>
                </Flex>
              </Button>
            ))}
          </Flex>
        </Flex>
      </View>
      
      {/* Main Content */}
      <View flex="1" padding="2rem" backgroundColor="var(--amplify-colors-background-primary)">
        <Flex direction="column" gap="2rem">
          {/* Breadcrumbs */}
          <Flex gap="0.5rem" color="var(--amplify-colors-neutral-60)">
            <Text>Dashboard</Text>
            <Text>/</Text>
            <Text>Overview</Text>
          </Flex>

          {error && (
            <View padding="1rem" backgroundColor="var(--amplify-colors-red-10)" color="var(--amplify-colors-red-80)" borderRadius="medium">
              <Text>{error}</Text>
            </View>
          )}

          {/* Plaid Link */}
          <Plaid getItems={getItemsAndAccounts}/>

          {/* Summary Cards */}
          <Summary assets={assets} liabilities={liabilities} isLoading={isLoading} />

          {/* Institutions Grid */}
          <Institutions 
            institutions={items} 
            isLoading={isLoading} 
          />
        </Flex>
      </View>
    </Flex>
  );
}
