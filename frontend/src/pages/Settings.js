import { View, Heading, Text, Flex, Card, Divider } from '@aws-amplify/ui-react';
import Plaid from '../components/Plaid';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const navigate = useNavigate();

  const handlePlaidSuccess = () => {
    // Navigate to the dashboard after successful connection
    navigate('/');
  };

  return (
    <View padding={{ base: '1rem', medium: '2rem' }}>
      <Flex direction="column" gap="2rem">
        <Heading level={3}>Settings</Heading>

        <Card>
          <Heading level={4}>Institution Connections</Heading>
          <Text variation="tertiary" marginBottom="1rem">
            Connect your financial institutions securely using Plaid
          </Text>
          <Plaid onSuccess={handlePlaidSuccess} />
        </Card>

        <Divider />

        <Card>
          <Heading level={4}>Account Preferences</Heading>
          <Text variation="tertiary">
            More settings and preferences coming soon.
          </Text>
        </Card>
      </Flex>
    </View>
  );
}