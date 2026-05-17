'use client';

import DSButton from '@/components/ds/DSButton';
import DSField from '@/components/ds/DSField';
import DSForm from '@/components/ds/DSForm';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSSelect from '@/components/ds/DSSelect';
import DSText from '@/components/ds/DSText';
import { useActionState } from 'react';
import { saveFeedback } from './actions';

const feedbackCategories = [
  { value: 'general', label: 'General feedback' },
  { value: 'event', label: 'Event experience' },
  { value: 'cards', label: 'Cards or rules' },
  { value: 'bug', label: 'Website issue' },
  { value: 'creator', label: 'Host or creator interest' },
  { value: 'other', label: 'Other' },
];

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
  const errors = state.errors ?? {};

  return (
    <DSPage>
      <DSSection.Card background="dark" padding="thick" width="form">
        <DSSection.Heading>
          <DSText.Eyebrow>Feedback</DSText.Eyebrow>
          <DSText.Heading as="h1">Leave Feedback</DSText.Heading>
        </DSSection.Heading>

        <DSSection.Text>
          <DSText.Body tone="muted">
            We&apos;d love to hear your thoughts on Relicry. Form submissions are posted to our public Discord feedback area.
          </DSText.Body>
        </DSSection.Text>

        <DSSection.Actions>
          <DSButton
            href="https://discord.gg/wbbsUEpC"
            label="Submit Directly in Discord"
            rel="noopener noreferrer"
            target="_blank"
            variant="primary"
          />
        </DSSection.Actions>

        <DSForm action={formAction} errors={errors} width="full">
          <DSField
            description="Shown publicly with your feedback."
            error={fieldError(errors.name)}
            label="Display name (optional)"
            maxLength={80}
            name="name"
            placeholder="Name or Discord handle"
          />
          <DSField
            description="Only include this if you are comfortable with it being public."
            error={fieldError(errors.contact)}
            label="Contact (optional)"
            maxLength={160}
            name="contact"
            placeholder="Email or Discord handle"
          />
          <DSSelect
            defaultValue="general"
            error={fieldError(errors.category)}
            label="What is this about?"
            name="category"
            options={feedbackCategories}
          />
          <DSField
            error={fieldError(errors.feedback)}
            label="Feedback"
            maxLength={1500}
            multiline
            name="feedback"
            placeholder="Your feedback..."
            required
            rows={5}
          />
          <DSForm.ButtonGroup>
            <DSButton label="Submit Feedback" submitOnEnter type="submit" variant="primary" />
          </DSForm.ButtonGroup>
        </DSForm>

        <FeedbackStatus errors={errors.form} message={state.message} />

        {state?.discordUrl && (
          <DSSection.Actions>
            <DSButton
              href={state.discordUrl}
              label="View your Discord feedback topic"
              rel="noopener noreferrer"
              target="_blank"
              variant="ghost"
            />
          </DSSection.Actions>
        )}
      </DSSection.Card>
    </DSPage>
  );
}

function FeedbackStatus({
  errors,
  message,
}: Readonly<{
  errors?: string[];
  message?: string;
}>) {
  if (errors?.length) {
    return (
      <DSSection.Text>
        {errors.map((error) => (
          <DSText.Body key={error} tone="danger">{error}</DSText.Body>
        ))}
      </DSSection.Text>
    );
  }

  if (message) {
    return (
      <DSSection.Text>
        <DSText.Body tone="success">{message}</DSText.Body>
      </DSSection.Text>
    );
  }

  return null;
}

function fieldError(errors?: string[]) {
  return errors?.join(' ');
}
