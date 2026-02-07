import { redirect } from 'next/navigation';

type Params = { card_id: string };

export default async function CardPage(
  { params }: { params: Promise<Params>; }
) {
  const { card_id } = await params;
  redirect(`/c/${card_id}/1`);
}