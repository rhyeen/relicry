
type Props = { cardId: string };

export default function CardCollectionAction({ cardId }: Props) {
  return (
    <div>
      <button>Add Card {cardId} to Collection</button>
    </div>
  );
}