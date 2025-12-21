export default function RewardPage({ params }: { params: { event_id: string, quest_id: string } }) {
  return <div>Reward Page for event {params.event_id} and quest {params.quest_id}</div>;
}