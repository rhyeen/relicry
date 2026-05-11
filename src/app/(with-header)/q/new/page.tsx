import EditQuestSlot from '@/components/client/EditQuest.slot';

export function generateMetadata() {
  return {
    title: 'Add new quest • Relicry',
    description: 'Add a new quest in Relicry.',
  };
}

export default function NewQuestAdminPage() {
  return <EditQuestSlot />;
}
