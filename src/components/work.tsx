import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
export function TextResponse({
  id,
  label,
  value,
  limit,
  onChange,
  error = '',
  hint,
  rows = 4,
  required = true,
  count = (text: string) => text.length,
}: {
  id: string;
  label: string;
  value: string;
  limit: number;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  rows?: number;
  required?: boolean;
  count?: (text: string) => number;
}) {
  return (
    <div class="work-field">
      <label for={id}>{label}</label>
      {hint && (
        <p id={`${id}-hint`} class="field-hint">
          {hint}
        </p>
      )}
      <textarea
        id={id}
        value={value}
        rows={rows}
        autoComplete="off"
        spellcheck={false}
        aria-required={required}
        aria-invalid={!!error}
        aria-describedby={`${id}-limit${hint ? ` ${id}-hint` : ''}${error ? ` ${id}-error` : ''}`}
        onInput={(e) => onChange(e.currentTarget.value)}
      />
      <p id={`${id}-limit`} class="field-limit">
        Up to {limit.toLocaleString('en-US')} characters. {count(value).toLocaleString('en-US')}{' '}
        used.
      </p>
      {error && (
        <p id={`${id}-error`} class="error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
export function ConfirmDialog({
  title,
  children,
  confirm,
  onConfirm,
  onCancel,
  cancel = 'Cancel',
}: {
  title: string;
  children: ComponentChildren;
  confirm: string;
  onConfirm: () => void;
  onCancel: () => void;
  cancel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = ref.current!;
    dialog.showModal();
    return () => {
      dialog.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      class="confirm-dialog"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-description"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      <h2 id="dialog-title">{title}</h2>
      <div id="dialog-description">{children}</div>
      <div class="actions">
        <button class="button" autoFocus onClick={onCancel}>
          {cancel}
        </button>
        <button class="button primary" onClick={onConfirm}>
          {confirm}
        </button>
      </div>
    </dialog>
  );
}
