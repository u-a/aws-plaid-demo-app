import { useParams } from 'react-router-dom';
import { useState } from 'react';
import { Divider, Flex, Heading, View } from '@aws-amplify/ui-react';
import Accounts from '../components/Accounts';
import Transactions from '../components/Transactions';

export default function Institution() {

  const { id } = useParams();

  const [accountMap, setAccountMap] = useState({});
  const [selectedAccount, setSelectedAccount] = useState(null);

  const updateAccounts = (accounts) => {
    const accountMap = accounts.reduce((acc, cur, idx) => {
      acc[cur.account_id] = cur;
      return acc;
    }, {});
    setAccountMap(accountMap);
  }

  const handleAccountSelect = (account) => {
    setSelectedAccount(account);
  }

  return (
    <Flex direction="column">
      <Divider/>
      <Heading level={5}>Institution</Heading>
      <Flex direction="row" gap="1rem">
        <View flex="1">
          <Heading level={6}>Accounts</Heading>
          <Accounts id={id} updateAccounts={updateAccounts} onAccountSelect={handleAccountSelect} selectedAccount={selectedAccount} />
        </View>
        <View flex="2">
          <Heading level={6}>Transactions</Heading>
          {selectedAccount ? (
            <Transactions id={id} accounts={accountMap} selectedAccount={selectedAccount} />
          ) : (
            <View>Select an account to view transactions.</View>
          )}
        </View>
      </Flex>
    </Flex>
  );
}
