import { Card, Heading } from '@aws-amplify/ui-react';
import { useNavigate } from 'react-router-dom';

export default function Institution({ institution }) {
  const link = `/institution/${institution.item_id}`;
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(link);
  }

  return (
    <Card onClick={handleClick} style={{cursor: 'pointer'}}>
      <Heading level={5}>{ institution.institution_name }</Heading>
    </Card>
  )
}
