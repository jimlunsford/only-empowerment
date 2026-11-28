// Only the current input method lives in memory. Firefox does not always inherit
// :focus-visible when navigation moves focus from a link to a scripted heading.
export function trackFocusModality() {
  const root = document.documentElement;
  const keyboard = (event: KeyboardEvent) => {
    if (!event.altKey && !event.ctrlKey && !event.metaKey) root.dataset.focusModality = 'keyboard';
  };
  const pointer = () => {
    root.dataset.focusModality = 'pointer';
  };
  // Direct entry is distinct from an actual keyboard action.
  root.dataset.focusModality = 'initial';
  document.addEventListener('keydown', keyboard, true);
  document.addEventListener('pointerdown', pointer, true);
  return () => {
    document.removeEventListener('keydown', keyboard, true);
    document.removeEventListener('pointerdown', pointer, true);
    delete root.dataset.focusModality;
  };
}
