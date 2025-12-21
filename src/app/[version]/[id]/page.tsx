export default function CardPage({ params }: { params: { version: string, id: string } }) {
  return <div>Card Page {params.version} {params.id}</div>;
}