import { TableRow, TableCell } from '@aws-amplify/ui-react';
import Currency from './Currency';

export default function Account({ account }) {

  const getBalanceColor = (type) => {
    if (type === 'depository' || type === 'investment') {
      return 'green';
    }
    if (type === 'loan' || type === 'credit') {
      return 'red';
    }
    return 'inherit';
  }

  return (
    <TableRow>
      <TableCell>{ account.name }</TableCell>
      <TableCell>
        <span style={{ color: getBalanceColor(account.type) }}>
          <Currency amount={ account.balances?.current} currency={ account.balances?.iso_currency_code }/>
        </span>
      </TableCell>
      <TableCell>{ account.type }</TableCell>
      <TableCell>{ account.subtype }</TableCell>
      <TableCell>****{ account.mask }</TableCell>
    </TableRow>
  )
}
