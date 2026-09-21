import type { ComponentChildren } from 'preact';
import { useEffect, useRef } from 'preact/hooks';
import { labels, limits, type Card, type Field } from '../next-move-model';
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
        Up to {limit.toLocaleString('en-US')} characters. {value.length.toLocaleString('en-US')}{' '}
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
export function FieldInput({
  field,
  value,
  onChange,
  error = '',
  hint,
  question,
}: {
  field: Field;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  question?: string;
}) {
  return (
    <TextResponse
      id={`field-${field}`}
      label={question || labels[field]}
      value={value}
      limit={limits[field]}
      onChange={onChange}
      error={error}
      hint={hint}
      rows={field === 'start' ? 3 : 4}
    />
  );
}
export function ConfirmDialog({
  title,
  children,
  confirm,
  onConfirm,
  onCancel,
}: {
  title: string;
  children: ComponentChildren;
  confirm: string;
  onConfirm: () => void;
  onCancel: () => void;
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
          Cancel
        </button>
        <button class="button primary" onClick={onConfirm}>
          {confirm}
        </button>
      </div>
    </dialog>
  );
}
export function LocalNotice({ artifact = 'Execution Card' }: { artifact?: string }) {
  return (
    <>
      <p>
        Your {artifact} will be stored in this browser on this device. Only Empowerment cannot
        recover it from another device.
      </p>
      <p>
        Someone using the same browser profile may be able to see it. Clearing browser or site data
        can remove it. The site does not send the saved record to Only Empowerment servers.
      </p>
    </>
  );
}
export function ExecutionCard({ card }: { card: Card }) {
  const order: Field[] = ['situation', 'action', 'start', 'obstacle', 'completion'];
  return (
    <article class="output-card execution-card" aria-labelledby="card-title">
      <div class="artifact-header">
        <p class="eyebrow">Only Empowerment · Next Move</p>
        <span class="planned-badge">Status: Planned</span>
      </div>
      <h2 id="card-title" tabIndex={-1}>
        Execution Card
      </h2>
      {order.map((field) => (
        <section key={field} class={`artifact-section artifact-${field}`}>
          <h3>{labels[field]}</h3>
          <p class="answer">{card[field]}</p>
        </section>
      ))}
      <p class="artifact-footnote">
        This is your plan. Creating it does not mean the action has been taken.
      </p>
      <p class="print-only">
        Based on Pure Execution Mode · jimlunsford.com/pure-execution-mode/
        <br />
        Built by Jim Lunsford · jimlunsford.com
      </p>
    </article>
  );
}
