import { Card, Flex, Heading, Text } from '@aws-amplify/ui-react';
import Currency from './Currency';

export default function Summary({ assets, liabilities }) {
  return (
    <Flex direction="row" gap="1rem" justifyContent="center">
      <Card width="20rem">
        <Heading level={5}>Total Assets</Heading>
        <Text>
          <Currency amount={assets} currency="USD" />
        </Text>
      </Card>
      <Card width="20rem">
        <Heading level={5}>Total Liabilities</Heading>
        <Text>
          <Currency amount={liabilities} currency="USD" />
        </Text>
      </Card>
    </Flex>
  );
}
