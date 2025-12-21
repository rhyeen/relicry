export default function TokenPage({ params }: { params: { token_version: string, quest_id: string } }) {
  return <div>Token Page for Version {params.token_version} - Quest {params.quest_id}</div>;
}