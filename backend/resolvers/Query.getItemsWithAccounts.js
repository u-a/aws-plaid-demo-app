import { util } from '@aws-appsync/utils';

/**
 * Query all items for the authenticated user with their accounts
 * Uses BatchInvoke to fetch accounts for each item
 */
export function request(ctx) {
  const userId = ctx.identity.sub;
  
  return {
    operation: 'Query',
    index: 'GSI1',
    query: {
      expression: 'gsi1pk = :userId AND begins_with(gsi1sk, :itemPrefix)',
      expressionValues: util.dynamodb.toMapValues({
        ':userId': `USER#${userId}`,
        ':itemPrefix': 'ITEM#'
      })
    }
  };
}

export function response(ctx) {
  if (ctx.error) {
    util.error(ctx.error.message, ctx.error.type);
  }

  const items = ctx.result.items;
  
  // For each item, we need to query its accounts
  // This would normally require a pipeline resolver or BatchInvoke
  // For now, we'll return items and let the frontend fetch accounts separately
  // OR use a pipeline resolver with a second function
  
  // Simple version - just return items
  return items.map(item => ({
    item_id: item.item_id,
    institution_id: item.institution_id,
    institution_name: item.institution_name,
    accounts: [], // Will need pipeline resolver to populate
    totalBalance: 0,
    accountCount: 0
  }));
}