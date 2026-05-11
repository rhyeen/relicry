'use client';

import LoginPanel from '@/components/client/LoginPanel';
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo } from "react";
import { useAuthUser } from '@/lib/client/useAuthUser';
import DSPage from '@/components/ds/DSPage';
import DSSection from '@/components/ds/DSSection';

function sanitizeNext(nextValue: string | null): string {
  if (!nextValue) return "/";
  // Prevent open redirects: only allow internal paths
  if (!nextValue.startsWith("/")) return "/";
  // Optional: block protocol-relative URLs like //evil.com
  if (nextValue.startsWith("//")) return "/";
  return nextValue;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginClient />
    </Suspense>
  );
}

function LoginClient() {
  const { user, ready } = useAuthUser();
  const router = useRouter();
  const sp = useSearchParams();

  const nextPath = useMemo(() => sanitizeNext(sp.get("next")), [sp]);

  useEffect(() => {
    if (user) {
      router.replace(nextPath);
    }
  }, [user, router, nextPath]);

  if (!ready) return null;

  return (
    <DSPage>
      <DSSection.Card width="fit-content">
        <LoginPanel />
      </DSSection.Card>
    </DSPage>
  );
}
