import styles from './EventList.module.css';

const events = [
  {
    id: 1,
    title: 'Community Town Hall',
    date: '2024-07-15T18:00:00Z',
    description: 'Join us for our monthly town hall to discuss the latest updates and community feedback.',
    location: 'Discord',
  },
  {
    id: 2,
    title: 'New Feature Showcase',
    date: '2024-07-22T16:00:00Z',
    description: 'Get a sneak peek at the new features coming to Relicry and ask your questions to the development team.',
    location: 'Twitch',
  },
  {
    id: 3,
    title: 'Developer Q&A',
    date: '2024-08-05T17:00:00Z',
    description: 'Live Q&A session with our lead developers. Bring your technical questions!',
    location: 'YouTube Live',
  },
];

export default function EventList() {
  return (
    <div className={styles.eventList}>
      {events.map(event => (
        <div key={event.id} className={styles.eventCard}>
          <div className="flex-grow">
            <h2 className={styles.eventTitle}>{event.title}</h2>
            <p className={styles.eventDate}>{new Date(event.date).toLocaleString()}</p>
            <p className={styles.eventDescription}>{event.description}</p>
            <p className={styles.eventLocation}>Location: <span className={styles.locationText}>{event.location}</span></p>
          </div>
        </div>
      ))}
    </div>
  );
}
