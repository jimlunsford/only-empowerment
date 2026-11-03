// Route-prefixed HTML IDs keep ordinary native fragment links compatible with the
// existing hash router. They are heading targets on one page, never new screens.
const patternRoute = '/period/discipline/pattern';
export const disciplineLessonAnchor = '/period/values/discipline/examine';
export const disciplineAnchor = (id: string) => `${patternRoute}/${id}`;
const occasionIds = [
  'promise',
  'first-action',
  'repeated-action',
  'miss',
  'return',
  'changed-capacity',
  'continuation',
];
export function disciplineAnchorRoute(fragment: string) {
  if (fragment === disciplineLessonAnchor) return '/period/values/discipline';
  if (occasionIds.some((id) => fragment === disciplineAnchor(id))) return patternRoute;
  return fragment;
}
