import { Flex, View, Heading, Text, Card } from '@aws-amplify/ui-react';
import Institution from './Institution';

export default function Institutions({ institutions = [], isLoading }) {
  const EmptyState = () => (
    <Card variation="outlined" textAlign="center" padding="2rem">
      <Heading level={5}>No Institutions Connected</Heading>
      <Text>Connect your first institution using Plaid Link above to get started</Text>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Flex wrap="wrap" gap="1rem">
      {[1, 2, 3].map((i) => (
        <Card key={i} width="300px" padding="1.5rem">
          <Flex direction="column" gap="1rem">
            <View backgroundColor="var(--amplify-colors-neutral-20)" height="24px" width="80%" />
            <View backgroundColor="var(--amplify-colors-neutral-20)" height="16px" width="60%" />
          </Flex>
        </Card>
      ))}
    </Flex>
  );

  return (
    <View>
      <Flex justifyContent="space-between" alignItems="center" marginBottom="1rem">
        <Heading level={4}>Connected Institutions</Heading>
      </Flex>
      
      {isLoading ? (
        <LoadingSkeleton />
      ) : institutions.length ? (
        <Flex wrap="wrap" gap="1.5rem">
          {institutions.map((institution) => (
            <Institution key={institution.institution_id} institution={institution}/>
          ))}
        </Flex>
      ) : (
        <EmptyState />
      )}
    </View>
  )
}
