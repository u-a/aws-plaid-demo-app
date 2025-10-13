import { TableRow, TableCell, Flex, Badge, Icon, Text } from '@aws-amplify/ui-react';
import Currency from './Currency';

export default function Account({ account, onAccountSelect, isSelected }) {
  const getBalanceColor = (type) => {
    if (type === 'depository' || type === 'investment') {
      return 'green';
    }
    if (type === 'loan' || type === 'credit') {
      return 'red';
    }
    return 'inherit';
  };

  const getAccountIcon = (type) => {
    switch (type) {
      case 'depository':
        return 'account_balance';
      case 'credit':
        return 'credit_card';
      case 'loan':
        return 'request_quote';
      case 'investment':
        return 'trending_up';
      default:
        return 'account_circle';
    }
  };

  const getAccountBadgeVariation = (type) => {
    switch (type) {
      case 'depository':
        return 'info';
      case 'credit':
        return 'warning';
      case 'loan':
        return 'error';
      case 'investment':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <TableRow 
      onClick={() => onAccountSelect(account)} 
      style={{
        cursor: 'pointer',
        backgroundColor: isSelected ? 'var(--amplify-colors-background-secondary)' : 'transparent',
        transition: 'background-color 0.2s ease'
      }}
    >
      <TableCell>
        <Flex alignItems="center" gap="1rem">
          <Icon fontSize="1.2rem">{getAccountIcon(account.type)}</Icon>
          <Flex direction="column">
            <Text>{account.name}</Text>
            <Text variation="tertiary" fontSize="small">****{account.mask}</Text>
          </Flex>
        </Flex>
      </TableCell>
      <TableCell>
        <Flex direction="column">
          <Text style={{ color: getBalanceColor(account.type), fontWeight: 'bold' }}>
            <Currency amount={account.balances?.current} currency={account.balances?.iso_currency_code}/>
          </Text>
          {account.balances?.available && (
            <Text variation="tertiary" fontSize="small">
              Available: <Currency amount={account.balances.available} currency={account.balances.iso_currency_code}/>
            </Text>
          )}
        </Flex>
      </TableCell>
      <TableCell>
        <Badge variation={getAccountBadgeVariation(account.type)}>
          {account.type} - {account.subtype}
        </Badge>
      </TableCell>
      <TableCell>
        <Text variation="tertiary">
          Last updated: {new Date(account.update_datetime).toLocaleDateString()}
        </Text>
      </TableCell>
    </TableRow>
  );
}

