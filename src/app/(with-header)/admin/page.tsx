import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';
import AdminControlsClient from './AdminControlsClient';

export function generateMetadata() {
  return {
    title: 'Admin Controls • Relicry',
    description: 'Administrative tools for Relicry.',
  };
}

export default function AdminPage() {
  return (
    <DSPage>
      <DSSection.Card background="darkBrown" padding="thick">
        <DSSection.Heading>
          <DSText.Eyebrow>Operations</DSText.Eyebrow>
          <DSText.Heading as="h1" size="2xl">Admin Controls</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body size="lg" tone="muted">
            Rebuild derived indexes and jump into administrative creation workflows.
          </DSText.Body>
        </DSSection.Text>
      </DSSection.Card>

      <AdminControlsClient />
    </DSPage>
  );
}
