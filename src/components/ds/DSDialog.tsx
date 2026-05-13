"use client";

import { Dialog } from '@base-ui/react';
import type { ComponentProps, ReactNode } from 'react';
import styles from "./DSDialog.module.css";
import DSButton from './DSButton';
import DSLoadingOverlay from './DSLoadingOverlay';

type DSDialogRootProps = Readonly<{
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onClose?: () => void;
  title?: string;
  description?: string;
  content?: ReactNode;
  actions?: ReactNode;
  disablePointerDismissal?: boolean;
  loading?: boolean;
}>;

type DSDialogCloseProps = Readonly<{
  text?: string;
  onClick?: () => void;
  variant?: ComponentProps<typeof DSButton>['variant'];
}>;

function Close({ text, onClick, variant = 'ghost' }: DSDialogCloseProps) {
  return (
    <Dialog.Close
      render={(
        <DSButton
          label={text || 'Close'}
          onClick={onClick}
          variant={variant}
        />
      )}
    />
  );
}

function DSDialogRoot({ loading, trigger, open, onOpenChange, onClose, title, description, content, actions, disablePointerDismissal }: DSDialogRootProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} disablePointerDismissal={disablePointerDismissal}>
      {trigger && <Dialog.Trigger className={styles.trigger}>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Backdrop
          className={styles.backdrop}
        />
        <Dialog.Popup className={styles.popup}>
          {onClose && (
            <Dialog.Close
              render={(
                <button
                  aria-label="Close dialog"
                  className={styles.iconClose}
                  onClick={onClose}
                  type="button"
                >
                  <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="18">
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            />
          )}
          {title && <Dialog.Title className={styles.title}>{title}</Dialog.Title>}
          {description && (
            <Dialog.Description className={styles.description}>
              {description}
            </Dialog.Description>
          )}
          <DSLoadingOverlay loading={loading} error={null} />
          <div className={styles.content} data-has-actions={actions ? 'true' : undefined}>
            {content}
          </div>
          {actions && (
            <div className={styles.actions}>
              {actions}
            </div>
          )}
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const DSDialog = Object.assign(DSDialogRoot, {
  Close,
});

export default DSDialog;
