'use client';

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
        <h1 className={styles.title}>Leave Feedback</h1>
        <p className={styles.subtitle}>We&apos;d love to hear your thoughts on Relicry!</p>
        <form action={formAction} className={styles.form}>
          <textarea
            name="feedback"
            rows={5}
            placeholder="Your feedback..."
            className={styles.textarea}
            required
          />
          <button
            type="submit"
            className={`${styles.button} goldButton`}
          >
            Submit Feedback
          </button>
        </form>
        {state?.message && (
          <p className={styles.message}>{state.message}</p>
        )}
      </div>
    </div>
  );
}
