export default function RewardsPage({ params }: { params: { id: string, quest_id: string } }) {
  return <div>Rewards Page for Event {params.id} - Quest {params.quest_id}</div>;
}
