'use client';

import DSLink from '@/components/ds/DSLink';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';
import DSText from '@/components/ds/DSText';

export default function PermissionDenied() {
  return (
    <DSPage>
      <DSSection.Card width="fit-content" background="dark">
        <DSSection.Heading>
          <DSText.Eyebrow>401</DSText.Eyebrow>
          <DSText.Heading as="h1">Permission Denied</DSText.Heading>
        </DSSection.Heading>
        <DSSection.Text>
          <DSText.Body>Well this is awkward! You have attempted to access a restricted page. Either you do not have permission to view this page or you need to log into an account with the appropriate permissions.</DSText.Body>
        </DSSection.Text>
        <DSLink href="/">Return Home</DSLink>
      </DSSection.Card >
    </DSPage>
  );
}
