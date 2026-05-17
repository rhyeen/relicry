"use client";

import { Button } from '@base-ui/react';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import type { AnchorHTMLAttributes, MutableRefObject, ReactNode } from 'react';
import styles from "./DSButton.module.css";

type ButtonIcon = 'checked' | ReactNode;

type DSButtonRootProps = Readonly<{
  label: string;
  className?: string;
  icon?: ButtonIcon;
  onClick?: () => void;
  dialogTrigger?: boolean;
  disabled?: boolean;
  loading?: boolean;
  href?: string;
  rel?: AnchorHTMLAttributes<HTMLAnchorElement>['rel'];
  target?: AnchorHTMLAttributes<HTMLAnchorElement>['target'];
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary' | 'secondary' | 'ghost' | 'success';
  size?: 'md' | 'lg';
  submitOnEnter?: boolean;
}>;

function DSButtonRoot({
  className: classNameProp,
  href,
  icon,
  label,
  onClick,
  rel,
  target,
  dialogTrigger,
  disabled,
  loading,
  submitOnEnter,
  type = 'button',
  variant = 'secondary',
  size = 'md',
}: DSButtonRootProps) {
  const buttonRef = useRef<HTMLElement | null>(null);
  const isLink = !!href;
  const isNative = !dialogTrigger && !isLink;
  const shouldSubmitOnEnter = submitOnEnter && variant === 'primary';
  const className = [
    styles.button,
    styles[`variant${capitalize(variant)}`],
    styles[`size${capitalize(size)}`],
    classNameProp,
  ].filter(Boolean).join(' ');
  const content = (
    <>
      {icon && <span className={styles.icon} aria-hidden="true">{renderIcon(icon)}</span>}
      <span>{label}</span>
    </>
  );

  useEffect(() => {
    if (!shouldSubmitOnEnter || disabled || loading) return;

    const button = buttonRef.current;
    if (!button) return;

    const ownerDocument = button.ownerDocument;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!shouldHandleEnterEvent(event)) return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!isTargetInEnterScope(button, target)) return;
      if (shouldIgnoreEnterTarget(button, target)) return;

      event.preventDefault();
      button.click();
    };

    ownerDocument.addEventListener('keydown', handleKeyDown);
    return () => ownerDocument.removeEventListener('keydown', handleKeyDown);
  }, [disabled, loading, shouldSubmitOnEnter]);

  if (isLink) {
    const isDisabled = disabled || loading;

    if (!isDisabled) {
      return (
        <Link
          className={className}
          href={href}
          data-loading={loading ? 'true' : undefined}
          onClick={onClick}
          ref={setButtonRef(buttonRef)}
          rel={rel}
          target={target}
        >
          {content}
        </Link>
      );
    }

    return (
      <a
        className={className}
        aria-disabled="true"
        data-disabled=""
        data-loading={loading ? 'true' : undefined}
        onClick={(event) => event.preventDefault()}
        ref={setButtonRef(buttonRef)}
        rel={rel}
        tabIndex={-1}
        target={target}
      >
        {content}
      </a>
    );
  }

  if (isNative) {
    return (
      <button
        className={className}
        onClick={onClick}
        ref={setButtonRef(buttonRef)}
        type={type}
        disabled={disabled || loading}
        data-loading={loading ? 'true' : undefined}
      >
        {content}
      </button>
    );
  }

  return (
    <Button
      className={className}
      onClick={onClick}
      ref={setButtonRef(buttonRef)}
      nativeButton={false}
      render={<div />}
      disabled={disabled || loading}
      data-loading={loading ? 'true' : undefined}
    >
      {content}
    </Button>
  );
}

function setButtonRef(ref: MutableRefObject<HTMLElement | null>) {
  return (node: HTMLElement | null) => {
    ref.current = node;
  };
}

function shouldHandleEnterEvent(event: KeyboardEvent) {
  return (
    event.key === 'Enter' &&
    !event.defaultPrevented &&
    !event.repeat &&
    !event.isComposing &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.shiftKey
  );
}

function isTargetInEnterScope(button: HTMLElement, target: Element) {
  const form = button.closest('form');
  if (form) return form.contains(target);

  const dialog = button.closest('[role="dialog"]');
  if (dialog) return dialog.contains(target);

  return button.ownerDocument.contains(target);
}

function shouldIgnoreEnterTarget(button: HTMLElement, target: Element) {
  if (button.contains(target)) return true;
  if (target.closest('textarea, [contenteditable="true"]')) return true;

  const input = target.closest('input');
  if (input && !isTextInput(input)) return true;

  const interactive = target.closest([
    'a[href]',
    'button',
    'select',
    '[role="button"]',
    '[role="checkbox"]',
    '[role="combobox"]',
    '[role="link"]',
    '[role="menuitem"]',
    '[role="option"]',
    '[role="radio"]',
    '[role="switch"]',
    '[role="tab"]',
  ].join(','));

  return !!interactive && interactive !== input;
}

function isTextInput(input: HTMLInputElement) {
  return ![
    'button',
    'checkbox',
    'color',
    'file',
    'hidden',
    'image',
    'radio',
    'range',
    'reset',
    'submit',
  ].includes(input.type);
}

function renderIcon(icon: ButtonIcon) {
  if (icon === 'checked') {
    return (
      <svg
        aria-hidden="true"
        fill="none"
        height="18"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="18"
      >
        <path d="m5 12.4 4.2 4.2L19 6.8" />
      </svg>
    );
  }

  return icon;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const DSButton = Object.assign(DSButtonRoot, {});

export default DSButton;
