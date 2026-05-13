"use client";

import DSButton from "@/components/ds/DSButton";
import { AdminRole, hasRole } from "@/entities/AdminRole";
import { useUser } from "@/lib/client/useUser";

type AdminPageActionProps = Readonly<{
  href: string;
  label: string;
  requiredRole: AdminRole;
}>;

export default function AdminPageAction({ href, label, requiredRole }: AdminPageActionProps) {
  const { user, ready } = useUser();

  if (!ready || !hasRole(user?.adminRoles, requiredRole)) {
    return null;
  }

  return <DSButton href={href} label={label} variant="primary" />;
}
