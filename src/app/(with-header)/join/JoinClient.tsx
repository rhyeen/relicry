'use client';

import { useState } from 'react';
import LoginDialog from '@/components/client/LoginDialog';
import DSButton from '@/components/ds/DSButton';
import DSSpinner from '@/components/ds/DSSpinner';
import DSText from '@/components/ds/DSText';
import { useUser } from '@/lib/client/useUser';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSLink from '@/components/ds/DSLink';

export default function JoinClient() {
  const { user, ready } = useUser();
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <DSPage>
      <DSSection>
        <DSSection.Heading>
          {!ready && (
            <>
              <DSText.Heading as="h1" id="join-title">
                Checking for an account...
              </DSText.Heading>
              <DSSpinner />
            </>
          )}
          { ready && !user &&
            <>
              <DSText.Eyebrow>Join the adventure</DSText.Eyebrow>
              <DSText.Heading as="h1" id="join-title">
                A game like no other.
              </DSText.Heading>
            </>
          }
          { ready && user &&
            <>
              <DSText.Eyebrow>You are logged in</DSText.Eyebrow>
              <DSText.Heading as="h1" id="join-title">
                Only one step left...
              </DSText.Heading>
            </>
          }
        </DSSection.Heading>
        { ready && !user &&
          <>
            <DSSection.Text>
              <DSText.Body size="lg">
                Relicry is a collectable card game (CCG) that you can exclusively obtain at sponsored events, like this one.
                You will be given a starter deck, a quest, and an opportunity to earn rewards. The more you play, the more cards you can collect, and the stronger your deck becomes.
              </DSText.Body>
              <DSText.Body size="lg">
                The game is entirely free to play. No purchases, no paywalls, no ads or evil data selling, just fun. All you need to get started is an account to prevent cheating and to save your progress.
              </DSText.Body>
            </DSSection.Text>
            <DSSection.Actions>
              <DSButton
                label="Log in or Sign Up"
                onClick={() => setLoginOpen(true)}
                variant="primary"
                size="lg"
              />
              <DSButton
                label="Learn More"
                href="/about"
                variant="secondary"
                size="lg"
              />
            </DSSection.Actions>
          </>
        }
        { ready && user &&
          <>
            <DSSection.Text>
              <DSText.Body size="lg">
                You can now claim your starter deck! Go up to the Relicry booth and show a staff member this page on your phone.
                They will show you what to do!
              </DSText.Body>
            </DSSection.Text>
          </>
        }
      </DSSection>
      { ready && user &&
        <DSSection.Card background="dark">
          <DSSection.Heading>
            <DSText.Heading as="h3">Still on the fence?</DSText.Heading>
          </DSSection.Heading>
          <DSText.Body>
            We get it. Relicry is a new kind of game and it can be hard to understand at first. But the best way to learn is to jump in and start playing. We promise it will be worth it.
          </DSText.Body>
          <DSText.Body>
            Feel free to explore the site, read about the game, maybe even join the Discord. You can always come back to this page whenever you are ready.
          </DSText.Body>
          <DSLink href="/about">Learn more about Relicry</DSLink>
        </DSSection.Card>
      }
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </DSPage>
  );
}
