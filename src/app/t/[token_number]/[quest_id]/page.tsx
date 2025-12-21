export default function QuestTokenPage({ params }: { params: { token_number: string, quest_id: string } }) {
  return <div>Quest Token Page {params.token_number} for quest {params.quest_id}</div>;
}