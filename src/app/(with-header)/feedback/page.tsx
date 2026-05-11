'use client';

import DSButton from '@/components/ds/DSButton';
import DSText from '@/components/ds/DSText';
import { saveFeedback } from './actions';
import styles from './page.module.css';
import { useActionState } from 'react';

const initialState = {
  errors: {
    name: undefined as string[] | undefined,
    contact: undefined as string[] | undefined,
    category: undefined as string[] | undefined,
    feedback: undefined as string[] | undefined,
    form: undefined as string[] | undefined,
  },
  message: undefined,
  discordUrl: undefined,
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
          We&apos;d love to hear your thoughts on Relicry. Form submissions are posted to our public Discord feedback area.
        </DSText.Body>
        <a
          href="https://discord.gg/wbbsUEpC"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.discordLink}
        >
          <DiscordIcon className={styles.discordIcon} />
          Submit directly in Discord
        </a>
        <form action={formAction} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Display name <span className={styles.optional}>optional</span></span>
            <input
              name="name"
              placeholder="Name or Discord handle"
              className={styles.input}
              maxLength={80}
            />
            <span className={styles.helpText}>Shown publicly with your feedback.</span>
          </label>
          {state?.errors?.name?.map((error) => (
            <DSText.Body tone="danger" className={styles.message} key={error}>{error}</DSText.Body>
          ))}

          <label className={styles.field}>
            <span className={styles.label}>Contact <span className={styles.optional}>optional</span></span>
            <input
              name="contact"
              placeholder="Email or Discord handle"
              className={styles.input}
              maxLength={160}
            />
            <span className={styles.helpText}>Only include this if you are comfortable with it being public.</span>
          </label>
          {state?.errors?.contact?.map((error) => (
            <DSText.Body tone="danger" className={styles.message} key={error}>{error}</DSText.Body>
          ))}

          <label className={styles.field}>
            <span className={styles.label}>What is this about?</span>
            <select name="category" className={styles.input} defaultValue="general">
              <option value="general">General feedback</option>
              <option value="event">Event experience</option>
              <option value="cards">Cards or rules</option>
              <option value="bug">Website issue</option>
              <option value="creator">Host or creator interest</option>
              <option value="other">Other</option>
            </select>
          </label>
          {state?.errors?.category?.map((error) => (
            <DSText.Body tone="danger" className={styles.message} key={error}>{error}</DSText.Body>
          ))}

          <label className={styles.field}>
            <span className={styles.label}>Feedback</span>
          <textarea
            name="feedback"
            rows={5}
            placeholder="Your feedback..."
            className={styles.textarea}
            maxLength={1500}
            required
          />
          </label>
          {state?.errors?.feedback?.map((error) => (
            <DSText.Body tone="danger" className={styles.message} key={error}>{error}</DSText.Body>
          ))}
          <DSButton label="Submit Feedback" type="submit" />
        </form>
        {state?.errors?.form?.map((error) => (
          <DSText.Body tone="danger" className={styles.message} key={error}>{error}</DSText.Body>
        ))}
        {state?.message && (
          <DSText.Body tone="success" className={styles.message}>{state.message}</DSText.Body>
        )}
        {state?.discordUrl && (
          <a
            href={state.discordUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.submissionLink}
          >
            View your Discord feedback topic
          </a>
        )}
      </div>
    </div>
  );
}

function DiscordIcon({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      role="img"
    >
      <path
        fill="currentColor"
        d="M20.317 4.369A19.791 19.791 0 0 0 15.37 2.85a.074.074 0 0 0-.079.037c-.211.375-.445.865-.608 1.249a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.249.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.947 1.519.07.07 0 0 0-.032.027C.533 8.846-.32 13.188.082 17.477a.082.082 0 0 0 .031.056 19.9 19.9 0 0 0 6.073 3.067.078.078 0 0 0 .084-.027 14.07 14.07 0 0 0 1.241-2.024.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.009c.121.099.247.198.373.292a.077.077 0 0 1-.007.128 12.299 12.299 0 0 1-1.873.891.077.077 0 0 0-.041.107c.36.698.772 1.366 1.24 2.023a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.083-3.067.077.077 0 0 0 .031-.055c.48-4.957-.806-9.263-3.719-13.081a.061.061 0 0 0-.031-.028ZM8.02 14.875c-1.183 0-2.157-1.086-2.157-2.421 0-1.336.955-2.422 2.157-2.422 1.211 0 2.176 1.096 2.157 2.422 0 1.335-.955 2.421-2.157 2.421Zm7.975 0c-1.183 0-2.157-1.086-2.157-2.421 0-1.336.955-2.422 2.157-2.422 1.211 0 2.176 1.096 2.157 2.422 0 1.335-.946 2.421-2.157 2.421Z"
      />
    </svg>
  );
}
