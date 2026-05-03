'use client';

import DSButton from '@/components/ds/DSButton';
import DSText from '@/components/ds/DSText';
import { saveFeedback } from './actions';
import styles from './page.module.css';
import { useActionState } from 'react';

const initialState = {
  errors: { feedback: undefined as string[] | undefined },
  message: undefined,
};

export default function FeedbackPage() {
  const [state, formAction] = useActionState(saveFeedback, initialState);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <DSText.Heading as="h1" size="display" align="center" className={styles.title}>
          Leave Feedback
        </DSText.Heading>
        <DSText.Body tone="muted" align="center" className={styles.subtitle}>
          We&apos;d love to hear your thoughts on Relicry!
        </DSText.Body>
        <form action={formAction} className={styles.form}>
          <textarea
            name="feedback"
            rows={5}
            placeholder="Your feedback..."
            className={styles.textarea}
            required
          />
          <DSButton label="Submit Feedback" />
        </form>
        {state?.message && (
          <DSText.Body tone="success" className={styles.message}>{state.message}</DSText.Body>
        )}
      </div>
    </div>
  );
}
