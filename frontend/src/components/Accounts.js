import { useState, useEffect, useMemo } from 'react';
import { generateClient } from 'aws-amplify/api';
import { ConsoleLogger } from 'aws-amplify/utils';
import { 
  Table, 
  TableHead, 
  TableRow, 
  TableCell, 
  TableBody, 
  Loader,
  Flex,
  SearchField,
  SelectField,
  View,
  Button,
  Text
} from '@aws-amplify/ui-react';
import { getAccounts as GetAccounts } from '../graphql/queries';
import Account from './Account';

const logger = new ConsoleLogger("Accounts");

export default function Accounts({ id, updateAccounts, onAccountSelect, selectedAccount }) {
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const client = generateClient();

  const getAccounts = async () => {
    setLoading(true);
    try {
      const res = await client.graphql({
        query: GetAccounts,
        variables: { id }
      });
      setAccounts(res.data.getAccounts);
      updateAccounts(res.data.getAccounts);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      logger.error('unable to get accounts', err);
    }
  }

  useEffect(() => {
    getAccounts();
  }, []);

  // Filter and sort accounts
  const filteredAndSortedAccounts = useMemo(() => {
    let result = [...accounts];
    
    // Apply search filter
    if (searchQuery) {
      result = result.filter(account => 
        account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.subtype.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(account => account.type === typeFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'balances') {
        aValue = a.balances?.current || 0;
        bValue = b.balances?.current || 0;
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    return result;
  }, [accounts, searchQuery, typeFilter, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <View>
      <Flex 
        direction={{ base: 'column', medium: 'row' }} 
        gap="1rem" 
        marginBottom={{ base: '1rem', medium: '1.5rem' }}
      >
        <SearchField
          label="Search accounts"
          placeholder="Search by name, type..."
          onChange={e => setSearchQuery(e.target.value)}
          value={searchQuery}
          size="small"
          width={{ base: '100%', medium: 'auto' }}
        />
        <SelectField
          label="Filter by type"
          onChange={e => setTypeFilter(e.target.value)}
          value={typeFilter}
          size="small"
          width={{ base: '100%', medium: 'auto' }}
        >
          <option value="all">All types</option>
          <option value="depository">Depository</option>
          <option value="credit">Credit</option>
          <option value="loan">Loan</option>
          <option value="investment">Investment</option>
        </SelectField>
      </Flex>

      <Table highlightOnHover={true} variation="striped">
        <TableHead>
          <TableRow>
            <TableCell as="th">
              <Button
                variation="link"
                onClick={() => handleSort('name')}
              >
                Account Details
                {sortConfig.key === 'name' && (
                  <Text marginLeft="0.5rem">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </Text>
                )}
              </Button>
            </TableCell>
            <TableCell as="th">
              <Button
                variation="link"
                onClick={() => handleSort('balances')}
              >
                Balance
                {sortConfig.key === 'balances' && (
                  <Text marginLeft="0.5rem">
                    {sortConfig.direction === 'asc' ? '↑' : '↓'}
                  </Text>
                )}
              </Button>
            </TableCell>
            <TableCell as="th">Type</TableCell>
            <TableCell as="th">Last Updated</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan="4">
                <Flex height="200px" alignItems="center" justifyContent="center">
                  <Loader size="large" />
                </Flex>
              </TableCell>
            </TableRow>
          ) : filteredAndSortedAccounts.length ? (
            filteredAndSortedAccounts.map((account) => {
              const isSelected = selectedAccount?.account_id === account.account_id;
              return (
                <Account
                  key={account.account_id}
                  account={account}
                  onAccountSelect={onAccountSelect}
                  isSelected={isSelected}
                />
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan="4">
                <Flex height="200px" alignItems="center" justifyContent="center" direction="column" gap="1rem">
                  <Text variation="tertiary">No accounts found</Text>
                  {searchQuery || typeFilter !== 'all' ? (
                    <Button
                      variation="link"
                      onClick={() => {
                        setSearchQuery('');
                        setTypeFilter('all');
                      }}
                    >
                      Clear filters
                    </Button>
                  ) : null}
                </Flex>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </View>
  );
}
