import { Dialog } from '@base-ui/react';
import styles from "./DSLoadingOverlay.module.css";
import dialogStyles from "./DSDialog.module.css";
import DSDialog from './DSDialog';

type DSLoadingOverlayRootProps = Readonly<{
  loading?: boolean;
  error: string | null;
  dismissError?: (dismiss: null) => void;
}>;

function DSLoadingOverlayRoot({ loading, error, dismissError }: DSLoadingOverlayRootProps) {
  if (error) {
    return (
      <DSDialog
        open={!!error}
        onOpenChange={() => dismissError?.(null)}
        title="An error occurred"
        description={error}
        actions={
          <DSDialog.Close text="Dismiss" onClick={() => dismissError?.(null)} />
        }
        disablePointerDismissal
      />
    );
  }

  return (
    <Dialog.Root open={loading} disablePointerDismissal>
      <Dialog.Portal>
        <Dialog.Backdrop
          className={dialogStyles.backdrop}
          style={{ opacity: 0.25 }}
        />
        <Dialog.Popup className={styles.popup}>
          <span className={styles.loader}></span>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

const DSLoadingOverlay = Object.assign(DSLoadingOverlayRoot, {});

export default DSLoadingOverlay;
