import EventList from '@/components/EventList';
import styles from './page.module.css';

export default function EventsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Upcoming Events</h1>
      <EventList />
    </div>
  );
}
