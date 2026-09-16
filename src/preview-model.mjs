export const MAX_RESPONSE = 600;
export function validateResponse(value) {
  if (!value.trim()) return 'Name one action before reviewing the card.';
  if (value.length > MAX_RESPONSE) return `Keep the action to ${MAX_RESPONSE} characters or fewer.`;
  return '';
}
export function previewText(action) {
  return `Only Empowerment\nWorkflow preview, not a completed tool\n\nSample action\n${action.trim()}\n\nStatus: planned. Creating this card does not mean the action is complete.\n\nBuilt by Jim Lunsford\nhttps://jimlunsford.com/`;
}
