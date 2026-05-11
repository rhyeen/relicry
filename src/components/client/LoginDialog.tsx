'use client';

import DSDialog from '@/components/ds/DSDialog';
import LoginPanel from './LoginPanel';

type LoginDialogProps = Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
}>;

export default function LoginDialog({ open, onOpenChange }: LoginDialogProps) {
  return (
    <DSDialog
      open={open}
      onOpenChange={onOpenChange}
      onClose={() => onOpenChange(false)}
      title="Sign in or create an account"
      content={<LoginPanel showIntro={false} onSignedIn={() => onOpenChange(false)} />}
    />
  );
}
