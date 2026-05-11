"use client";

import DSButton from "@/components/ds/DSButton";
import { useAuthUser } from "@/lib/client/useAuthUser";

export default function HomeProfileAction() {
  const { user, ready } = useAuthUser();

  if (!ready) {
    return <DSButton href="/login" label="Log In or Sign Up" variant="primary" />;
  }

  return user ? (
    <DSButton href="/profile" label="View Your Profile" variant="primary" />
  ) : (
    <DSButton href="/login" label="Log In or Sign Up" variant="primary" />
  );
}
