import { util } from '@aws-appsync/utils';

/**
 * Step 1: Get all items for user
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
  
  // Store items in stash for next function
  ctx.stash.items = ctx.result.items;
  return ctx.result.items;
}