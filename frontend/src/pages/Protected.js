import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { View, Heading, Flex, Text } from '@aws-amplify/ui-react';
import { getItems as GetItems, getAccounts as GetAccounts } from '../graphql/queries';
import Institutions from '../components/Institutions';
import Summary from '../components/Summary';

const logger = new ConsoleLogger("Protected");

export default function Protected() {
  const [items, setItems] = useState([]);
  const [assets, setAssets] = useState(0);
  const [liabilities, setLiabilities] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const client = generateClient();

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
      setLastUpdated(new Date());

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
    <Flex direction="column" gap={{ base: '1rem', medium: '2rem' }}>
      {/* Breadcrumbs */}
      <Flex 
        gap="0.5rem" 
        color="var(--amplify-colors-neutral-60)"
        display={{ base: 'none', medium: 'flex' }}
      >
        <Text>Dashboard</Text>
        <Text>/</Text>
        <Text>Overview</Text>
      </Flex>

      {error && (
        <View 
          padding="1rem" 
          backgroundColor="var(--amplify-colors-red-10)" 
          color="var(--amplify-colors-red-80)" 
          borderRadius="medium"
        >
          <Text fontSize={{ base: 'small', medium: 'medium' }}>{error}</Text>
        </View>
      )}

      {/* Summary Cards */}
      <Summary assets={assets} liabilities={liabilities} isLoading={isLoading} />

      {/* Institutions Grid */}
      <Institutions 
        institutions={items} 
        isLoading={isLoading} 
        onRefresh={getItemsAndAccounts} 
        lastUpdated={lastUpdated} 
      />
    </Flex>
  );
}
