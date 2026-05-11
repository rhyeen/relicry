'use client';

import DSLink from '@/components/ds/DSLink';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';

export default function NotFound() {
  return (
    <DSPage>
      <DSSection.Card width="fit-content" background="dark">
        <DSSection.Heading>
          <DSText.Eyebrow>404</DSText.Eyebrow>
          <DSText.Heading as="h1">Page Not Found</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body>Oops! It looks like you went to a page that no longer exists or has never existed. That is okay. We will get you back home.</DSText.Body>
        </DSSection.Text>
        <DSLink href="/">Return Home</DSLink>
      </DSSection.Card >
    </DSPage>
  );
}
