import { TableRow, TableCell, Flex, Text, Badge } from '@aws-amplify/ui-react';
import Currency from './Currency';

export default function Transaction({ transaction, account }) {
  const getAmountColor = (amount) => {
    const value = parseFloat(amount);
    return value >= 0 ? 'green' : 'red';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCategoryBadgeVariation = (category) => {
    const categoryMap = {
      'Food and Drink': 'info',
      'Travel': 'warning',
      'Shopping': 'success',
      'Payment': 'error',
    };
    return categoryMap[category?.[0]] || 'default';
  };

  return (
    <TableRow>
      <TableCell>
        <Flex direction="column">
          <Text fontWeight="bold">{transaction.name}</Text>
          {transaction.merchant_name && (
            <Text variation="tertiary" fontSize="small">
              {transaction.merchant_name}
            </Text>
          )}
        </Flex>
      </TableCell>
      <TableCell>
        <Text color={getAmountColor(transaction.amount)} fontWeight="bold">
          <Currency 
            amount={Math.abs(transaction.amount)} 
            currency={account?.balances?.iso_currency_code} 
          />
        </Text>
      </TableCell>
      <TableCell>
        <Text>{formatDate(transaction.date)}</Text>
      </TableCell>
      <TableCell>
        <Text variation="tertiary">{account?.name}</Text>
      </TableCell>
      <TableCell>
        {transaction.category && (
          <Badge variation={getCategoryBadgeVariation(transaction.category)}>
            {transaction.category[0]}
          </Badge>
        )}
      </TableCell>
    </TableRow>
  );
}
