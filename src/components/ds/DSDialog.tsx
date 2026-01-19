import { Dialog } from '@base-ui/react';
import styles from "./DSDialog.module.css";

type DSDialogRootProps = Readonly<{
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  description?: string;
  content?: React.ReactNode;
  actions?: React.ReactNode;
  disablePointerDismissal?: boolean;
}>;

type DSDialogCloseProps = Readonly<{
  text?: string;
  onClick?: () => void;
}>;

function Close({ text, onClick }: DSDialogCloseProps) {
  return <Dialog.Close className={styles.close} onClick={onClick}>{text || 'Close'}</Dialog.Close>;
}

function DSDialogRoot({ trigger, open, onOpenChange, title, description, content, actions, disablePointerDismissal }: DSDialogRootProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange} disablePointerDismissal={disablePointerDismissal}>
      {trigger && <Dialog.Trigger className={styles.trigger}>{trigger}</Dialog.Trigger>}
      <Dialog.Portal>
        <Dialog.Backdrop className={styles.backdrop} />
        <Dialog.Popup className={styles.popup}>
          <Dialog.Title className={styles.title}>{title}</Dialog.Title>
          <Dialog.Description className={styles.description}>
            {description}
          </Dialog.Description>
          <div className={styles.content}>
            {content}
          </div>
          <div className={styles.actions}>
            {actions}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const DSDialog = Object.assign(DSDialogRoot, {
  Close,
});

export default DSDialog;
