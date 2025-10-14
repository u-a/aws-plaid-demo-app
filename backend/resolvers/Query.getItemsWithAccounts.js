import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ITEMS_TABLE = process.env.ITEMS_TABLE_NAME;
const ACCOUNTS_TABLE = process.env.ACCOUNTS_TABLE_NAME;

export const handler = async (event) => {
  console.log('getItemsWithAccounts event:', JSON.stringify(event, null, 2));
  
  try {
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    // Fetch all items for user
    const itemsParams = {
      TableName: ITEMS_TABLE,
      IndexName: 'user-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    const itemsResult = await docClient.send(new QueryCommand(itemsParams));
    const items = itemsResult.Items || [];

    // Fetch accounts for each item
    const itemsWithAccounts = await Promise.all(
      items.map(async (item) => {
        const accountsParams = {
          TableName: ACCOUNTS_TABLE,
          IndexName: 'item-index', // GSI on item_id
          KeyConditionExpression: 'item_id = :itemId',
          ExpressionAttributeValues: {
            ':itemId': item.item_id
          }
        };

        const accountsResult = await docClient.send(new QueryCommand(accountsParams));
        const accounts = accountsResult.Items || [];

        // Calculate total balance for this item
        const totalBalance = accounts.reduce((sum, account) => {
          return sum + (parseFloat(account.balances?.current) || 0);
        }, 0);

        return {
          item_id: item.item_id,
          institution_id: item.institution_id,
          institution_name: item.institution_name,
          accounts: accounts,
          totalBalance: parseFloat(totalBalance.toFixed(2)),
          accountCount: accounts.length
        };
      })
    );

    return itemsWithAccounts;

  } catch (error) {
    console.error('Error fetching items with accounts:', error);
    throw new Error(`Failed to fetch items with accounts: ${error.message}`);
  }
};