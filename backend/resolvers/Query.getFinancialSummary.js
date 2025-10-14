import { util } from '@aws-appsync/utils';

/**
 * Query all accounts for the authenticated user and calculate financial summary
 * Data model: pk = "ACCOUNT#<account_id>", sk = "USER#<user_id>"
 */
export function request(ctx) {
  const userId = ctx.identity.sub;
  
  return {
    operation: 'Query',
    index: 'GSI1',
    query: {
      expression: 'gsi1pk = :userId AND begins_with(gsi1sk, :accountPrefix)',
      expressionValues: util.dynamodb.toMapValues({
        ':userId': `USER#${userId}`,
        ':accountPrefix': 'ACCOUNT#'
      })
    }
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  const accounts = ctx.result.items;
  
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
    
    // Only process USD accounts
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
    lastUpdated: util.time.nowISO8601()
  };
}