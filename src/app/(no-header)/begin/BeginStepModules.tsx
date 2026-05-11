"use client";

import DSButton from '@/components/ds/DSButton';
import DSIconButton from '@/components/ds/DSIconButton';
import { HomeIcon } from '@/components/ds/DSNavIcons';
import DSText from '@/components/ds/DSText';
import { useAuthUser } from '@/lib/client/useAuthUser';
import { useEffect, useMemo, useState } from 'react';
import styles from './page.module.css';

export type BeginStep = {
  id: string;
  eyebrow: string;
  title: string;
  summary: string;
  body: string[];
  callout: string;
  cta: 'auth' | 'events' | 'cards' | 'profile';
};

type Props = Readonly<{
  steps: BeginStep[];
}>;

const STORAGE_KEY = 'relicry.begin.reviewedSteps';

export default function BeginStepModules({ steps }: Props) {
  const [openStepIds, setOpenStepIds] = useState<string[]>(steps[0]?.id ? [steps[0].id] : []);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.every((value) => typeof value === 'string')) {
            setCompletedSteps(parsed);
          }
        } catch {
          setCompletedSteps([]);
        }
      }
      setHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
  }, [completedSteps, hydrated]);

  const completedSet = useMemo(() => new Set(completedSteps), [completedSteps]);
  const completedCount = steps.filter((step) => completedSet.has(step.id)).length;
  const allComplete = steps.length > 0 && completedCount === steps.length;

  const toggleOpen = (stepId: string) => {
    setOpenStepIds((current) => (
      current.includes(stepId)
        ? current.filter((id) => id !== stepId)
        : [...current, stepId]
    ));
  };

  const toggleCompleted = (stepId: string) => {
    setCompletedSteps((current) => (
      current.includes(stepId)
        ? current.filter((id) => id !== stepId)
        : [...current, stepId]
    ));
  };

  return (
    <section className={styles.steps} aria-labelledby="starter-steps">
      <div className={styles.progressPanel} data-complete={allComplete ? 'true' : undefined}>
        <div className={styles.progressHeader}>
          <div>
            <DSText.Eyebrow className={styles.progressEyebrow}>Progress</DSText.Eyebrow>
            <DSText.Heading as="h2" id="starter-steps" size="xl" className={styles.progressTitle}>
              {completedCount} of {steps.length} steps completed
            </DSText.Heading>
          </div>
          <DSIconButton href="/" label="Exit to Home Page" title="Exit to Home Page">
            <HomeIcon />
          </DSIconButton>
        </div>
        <div className={styles.progressTrack} data-complete={allComplete ? 'true' : undefined} aria-hidden="true">
          <span style={{ width: `${(completedCount / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className={styles.stepList}>
        {steps.map((step, index) => {
          const open = openStepIds.includes(step.id);
          const completed = completedSet.has(step.id);

          return (
            <article className={styles.stepCard} data-completed={completed ? 'true' : undefined} key={step.id}>
              <button
                className={styles.stepHeader}
                type="button"
                aria-expanded={open}
                aria-controls={`${step.id}-panel`}
                onClick={() => toggleOpen(step.id)}
              >
                <span className={styles.stepNumber}>{index + 1}</span>
                <span className={styles.stepHeading}>
                  <span className={styles.stepEyebrow}>{step.eyebrow}</span>
                  <span className={styles.stepTitle}>{step.title}</span>
                  <span className={styles.stepSummary}>{step.summary}</span>
                </span>
                <span className={styles.stepStatus}>{open ? 'Hide' : completed ? 'Completed' : 'Read'}</span>
              </button>

              <div className={styles.stepPanel} id={`${step.id}-panel`} hidden={!open}>
                <div className={styles.stepBody}>
                  {step.body.map((paragraph) => (
                    <DSText.Body className={styles.copy} key={paragraph}>{paragraph}</DSText.Body>
                  ))}
                  <div className={styles.callout}>
                    <DSText.Body weight="semibold" className={styles.calloutText}>{step.callout}</DSText.Body>
                  </div>
                  <div className={styles.stepActions}>
                    <StepCta type={step.cta} />
                    <DSButton
                      icon={completed ? 'checked' : undefined}
                      label={completed ? 'Completed' : 'Complete Step'}
                      onClick={() => toggleCompleted(step.id)}
                      variant={completed ? 'success' : 'secondary'}
                    />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function StepCta({ type }: Readonly<{ type: BeginStep['cta'] }>) {
  const { user, ready } = useAuthUser();

  if (type === 'auth') {
    if (!ready) {
      return <DSButton href="/login?next=/begin" label="Log In to Continue" variant="primary" />;
    }

    return user ? (
      <DSButton href="/profile" label="View Your Profile" variant="primary" />
    ) : (
      <DSButton href="/login?next=/begin" label="Log In to Continue" variant="primary" />
    );
  }

  if (type === 'events') {
    return <DSButton href="/events" label="Find the Relicry Booth" variant="primary" />;
  }

  if (type === 'cards') {
    return <DSButton href="/cards" label="Browse Cards" variant="primary" />;
  }

  return <DSButton href="/profile" label="Continue Your Quest" variant="primary" />;
}
