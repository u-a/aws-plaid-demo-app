import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const ACCOUNTS_TABLE = process.env.ACCOUNTS_TABLE_NAME;

export const handler = async (event) => {
  console.log('getFinancialSummary event:', JSON.stringify(event, null, 2));
  
  try {
    // Get user ID from Cognito identity
    const userId = event.identity?.sub;
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const params = {
      TableName: ACCOUNTS_TABLE,
      IndexName: 'user-index',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    };

    const result = await docClient.send(new QueryCommand(params));
    const accounts = result.Items || [];

    // Initialize counters
    let totalAssets = 0;
    let totalLiabilities = 0;
    let depositoryAssets = 0;
    let investmentAssets = 0;
    let creditLiabilities = 0;
    let loanLiabilities = 0;

    // Calculate totals
    accounts.forEach(account => {
      const balance = parseFloat(account.balances?.current) || 0;
      const currency = account.balances?.iso_currency_code;

      // Only process USD accounts (extend this for multi-currency support)
      if (currency === 'USD' || !currency) {
        const accountType = account.type?.toLowerCase();

        switch (accountType) {
          case 'depository':
            depositoryAssets += balance;
            totalAssets += balance;
            break;
          case 'investment':
            investmentAssets += balance;
            totalAssets += balance;
            break;
          case 'credit':
            creditLiabilities += Math.abs(balance);
            totalLiabilities += Math.abs(balance);
            break;
          case 'loan':
            loanLiabilities += Math.abs(balance);
            totalLiabilities += Math.abs(balance);
            break;
          default:
            console.warn(`Unknown account type: ${accountType}`);
        }
      }
    });

    const netWorth = totalAssets - totalLiabilities;

    return {
      totalAssets: parseFloat(totalAssets.toFixed(2)),
      totalLiabilities: parseFloat(totalLiabilities.toFixed(2)),
      netWorth: parseFloat(netWorth.toFixed(2)),
      assetsByType: {
        depository: parseFloat(depositoryAssets.toFixed(2)),
        investment: parseFloat(investmentAssets.toFixed(2)),
        total: parseFloat(totalAssets.toFixed(2))
      },
      liabilitiesByType: {
        credit: parseFloat(creditLiabilities.toFixed(2)),
        loan: parseFloat(loanLiabilities.toFixed(2)),
        total: parseFloat(totalLiabilities.toFixed(2))
      },
      lastUpdated: new Date().toISOString()
    };

  } catch (error) {
    console.error('Error calculating financial summary:', error);
    throw new Error(`Failed to calculate financial summary: ${error.message}`);
  }
};