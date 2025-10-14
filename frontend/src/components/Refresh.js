import React from 'react';
import { Button, Flex, Text } from '@aws-amplify/ui-react';

export default function Refresh({ onRefresh, isLoading, lastUpdated }) {
  return (
    <Flex justifyContent="flex-end" alignItems="center" gap="1rem">
      {lastUpdated && (
        <Text fontSize="0.8rem" color="var(--amplify-colors-neutral-60)">
          Last updated: {lastUpdated.toLocaleString()}
        </Text>
      )}
      <Button onClick={onRefresh} disabled={isLoading}>
        {isLoading ? 'Refreshing...' : 'Refresh'}
      </Button>
    </Flex>
  );
}