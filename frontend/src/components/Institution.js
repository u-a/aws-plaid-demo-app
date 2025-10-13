import { Card, Heading, Flex, Text, View } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

export default function Institution({ institution }) {
  const link = `/institution/${institution.item_id}`;
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(link);
  }

  return (
    <Card
      onClick={handleClick}
      width="300px"
      padding="1.5rem"
      style={{
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        ':hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }
      }}
    >
      <Flex direction="column" gap="1rem">
        <Flex justifyContent="space-between" alignItems="center">
          <View>
            <Heading level={5}>{ institution.institution_name }</Heading>
            <Text color="var(--amplify-colors-neutral-60)" fontSize="small">
              {institution.accounts?.length || 0} Accounts
            </Text>
          </View>
        </Flex>
        
        <Flex gap="1rem" wrap="wrap">
          {institution.accounts?.map(account => (
            <View
              key={account.account_id}
              backgroundColor="var(--amplify-colors-background-secondary)"
              padding="0.5rem"
              borderRadius="4px"
            >
              <Text fontSize="small">{account.name}</Text>
            </View>
          )).slice(0, 3)}
          {(institution.accounts?.length || 0) > 3 && (
            <Text fontSize="small" color="var(--amplify-colors-neutral-60)">
              +{institution.accounts.length - 3} more
            </Text>
          )}
        </Flex>
      </Flex>
    </Card>
  )
}
