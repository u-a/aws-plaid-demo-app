import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { View, Heading, Flex } from '@aws-amplify/ui-react';
import { getItems as GetItems, getAccounts as GetAccounts } from '../graphql/queries';
import Plaid from '../components/Plaid';
import Institutions from '../components/Institutions';
import Summary from '../components/Summary';

const logger = new ConsoleLogger("Protected");

export default function Protected() {
  const [items, setItems] = useState([]);
  const [assets, setAssets] = useState(0);
  const [liabilities, setLiabilities] = useState(0);
  const client = generateClient();

  const getItemsAndAccounts = async () => {
    try {
      const res = await client.graphql({
        query: GetItems
      });
      logger.info(res);
      const items = res.data.getItems.items;
      setItems(items);

      let totalAssets = 0;
      let totalLiabilities = 0;

      for (const item of items) {
        const accountsRes = await client.graphql({
          query: GetAccounts,
          variables: { id: item.item_id }
        });
        const accounts = accountsRes.data.getAccounts;
        accounts.forEach(account => {
          const balance = account.balances?.current;
          const currency = account.balances?.iso_currency_code;

          if (balance != null && currency === 'USD') { // Only sum USD accounts with a valid balance
            if (account.type === 'depository' || account.type === 'investment') {
              totalAssets += balance;
            }
            if (account.type === 'loan' || account.type === 'credit') {
              totalLiabilities += balance;
            }
          }
        });
      }

      setAssets(totalAssets);
      setLiabilities(totalLiabilities);

    } catch (err) {
      logger.error('unable to get items or accounts', err);
    }
  }

  useEffect(() => {
    getItemsAndAccounts();
  }, []);

  return (
    <Flex direction="column" gap="1rem">
      <Plaid getItems={getItemsAndAccounts}/>
      <Summary assets={assets} liabilities={liabilities} />
      {(items && items.length) ? (
        <View>
          <Institutions institutions={items}/>
        </View>
      ) : (<div/>)
      }
    </Flex>
  );
}
