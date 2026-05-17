import EditHeraldSlot from '@/components/client/EditHerald.slot';
import DSPage from '@/components/ds/DSPage';
import { Suspense } from 'react';

export function generateMetadata() {
  return {
    title: 'New Herald • Relicry',
    description: 'Create a new herald.',
  };
}

export default function NewHeraldPage() {
  return (
    <DSPage>
      <Suspense fallback={<div>Loading form...</div>}>
        <NewHeraldPageData />
      </Suspense>
    </DSPage>
  );
}

function NewHeraldPageData() {
  return <EditHeraldSlot />;
}
