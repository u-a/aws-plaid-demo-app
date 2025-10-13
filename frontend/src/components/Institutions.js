import { Flex, View, Heading } from '@aws-amplify/ui-react';
import Institution from './Institution';

export default function Institutions({ institutions = []}) {
  return (
    <Flex direction="column" gap="1rem">
      <Heading level={4}>Institutions</Heading>
      {institutions.length ? (
        institutions.map((institution) => {
          return <Institution key={institution.institution_id} institution={institution}/>;
        })
      ) : (
        <View>No institutions found</View>
      )}
    </Flex>
  )
}
