import { util } from '@aws-appsync/utils';

/**
 * Step 2: For each item, get its accounts
 */
export function request(ctx) {
  const items = ctx.stash.items;
  const userId = ctx.identity.sub;
  
  // Create batch get requests for all accounts
  const batchGetItems = items.map(item => ({
    operation: 'Query',
    query: {
      expression: 'pk = :itemPk AND begins_with(sk, :accountPrefix)',
      expressionValues: util.dynamodb.toMapValues({
        ':itemPk': `ITEM#${item.item_id}`,
        ':accountPrefix': 'ACCOUNT#'
      })
    }
  }));
  
  // For simplicity, we'll query accounts for the first item
  // In production, use BatchInvoke or multiple queries
  if (items.length > 0) {
    return {
      operation: 'Query',
      query: {
        expression: 'gsi1pk = :userId AND begins_with(gsi1sk, :accountPrefix)',
        expressionValues: util.dynamodb.toMapValues({
          ':userId': `USER#${userId}`,
          ':accountPrefix': 'ACCOUNT#'
        })
      },
      index: 'GSI1'
    };
  }
  
  return { operation: 'Query', query: {} };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }
  
  const items = ctx.stash.items;
  const allAccounts = ctx.result.items;
  
  // Group accounts by item_id
  const accountsByItem = {};
  allAccounts.forEach(account => {
    const itemId = account.item_id;
    if (!accountsByItem[itemId]) {
      accountsByItem[itemId] = [];
    }
    accountsByItem[itemId].push(account);
  });
  
  // Combine items with their accounts
  return items.map(item => {
    const accounts = accountsByItem[item.item_id] || [];
    const totalBalance = accounts.reduce((sum, acc) => 
      sum + (parseFloat(acc.balances?.current) || 0), 0
    );
    
    return {
      item_id: item.item_id,
      institution_id: item.institution_id,
      institution_name: item.institution_name,
      accounts: accounts,
      totalBalance: parseFloat(totalBalance.toFixed(2)),
      accountCount: accounts.length
    };
  });
}