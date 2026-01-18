import { Toggle } from '@base-ui/react';
import styles from "./DSToggle.module.css";

type DSToggleRootProps = Readonly<{
  ariaLabel: string;
  children: React.ReactNode;
  pressed?: boolean;
  value?: string;
  onChange?: (pressed: boolean) => void;
}>;

type DSToggleCustomProps = Readonly<{
  ariaLabel: string;
  renderIfPressed: {
    buttonClassName?: string;
    children: React.ReactNode;
  };
  renderIfNotPressed: {
    buttonClassName?: string;
    children: React.ReactNode;
  };
  pressed?: boolean;
  value?: string;
  onChange?: (pressed: boolean) => void;
}>;

type DSToggleTextProps = Readonly<{
  label: string;
  pressed?: boolean;
  onChange?: (pressed: boolean) => void;
  value?: string;
}>;

function DSToggleRoot({ value, ariaLabel, children, pressed, onChange }: DSToggleRootProps) {
  return (
    <DSToggleCustom
      value={value}
      ariaLabel={ariaLabel}
      renderIfPressed={{
        children: (
          <span className={styles.buttonContent}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={styles.icon}
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M20 6L9 17l-5-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {children}
          </span>
        ),
        buttonClassName: styles.pressed,
      }}
      renderIfNotPressed={{
        children: (
          <span className={styles.buttonContent}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className={styles.icon}
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {children}
          </span>
        ),
        buttonClassName: styles.notPressed,
      }}
      pressed={pressed}
      onChange={onChange}
    />
  );
}

function DSToggleCustom({ value, ariaLabel, renderIfPressed, renderIfNotPressed, pressed, onChange }: DSToggleCustomProps) {
  return (
    <Toggle
      aria-label={ariaLabel}
      pressed={pressed}
      className={styles.toggle}
      value={value}
      render={(props, state) => {
        if (state.pressed) {
          return (
            <button type="button" {...props} className={renderIfPressed.buttonClassName}>
              {renderIfPressed.children}
            </button>
          );
        } else {
          return (
            <button type="button" {...props} className={renderIfNotPressed.buttonClassName}>
              {renderIfNotPressed.children}
            </button>
          );
        }
      }}
      onPressedChange={(newPressed) => {
        console.log("DSToggle onPressedChange:", newPressed);
        if (onChange) {
          onChange(newPressed);
        }
      }}
    />
  );
}

function DSToggleText({ value, label, pressed, onChange }: DSToggleTextProps) {
  return (
    <DSToggleRoot
      value={value}
      ariaLabel={label}
      pressed={pressed}
      onChange={onChange}
    >
      {label}
    </DSToggleRoot>
  );
}

const DSToggle = Object.assign(DSToggleRoot, {
  Text: DSToggleText,
  Custom: DSToggleCustom,
});

export default DSToggle;
