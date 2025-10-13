import { Card, Flex, Heading, Text, View } from '@aws-amplify/ui-react';
import Currency from './Currency';

export default function Summary({ assets, liabilities, isLoading }) {
  const netWorth = assets - liabilities;

  const SummaryCard = ({ title, amount, subtitle, trend }) => (
    <Card width="20rem" padding="1.5rem" backgroundColor="white">
      <Flex direction="column" gap="0.5rem">
        <Text color="gray">{title}</Text>
        {isLoading ? (
          <View backgroundColor="var(--amplify-colors-neutral-20)" height="2rem" width="80%" />
        ) : (
          <Heading level={4}>
            <Currency amount={amount} currency="USD" />
          </Heading>
        )}
        {subtitle && (
          <Text fontSize="small" color={trend === 'up' ? 'green' : trend === 'down' ? 'red' : 'inherit'}>
            {subtitle}
          </Text>
        )}
      </Flex>
    </Card>
  );

  return (
    <Flex 
      direction={{ base: 'column', medium: 'row' }} 
      gap={{ base: '1rem', medium: '1.5rem' }} 
      justifyContent="center"
    >
      <SummaryCard 
        title="Total Assets"
        amount={assets}
        isLoading={isLoading}
      />
      <SummaryCard 
        title="Total Liabilities"
        amount={liabilities}
        isLoading={isLoading}
      />
      <SummaryCard 
        title="Net Worth"
        amount={netWorth}
        isLoading={isLoading}
      />
    </Flex>
  );
}
