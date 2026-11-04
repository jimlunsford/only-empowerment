import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { disciplineAnchorRoute } from './period-discipline-navigation';
// The root fallback contains these reading anchors when scripts are unavailable.
// With scripts running, the same ordinary links open their complete app lessons.
const readingRoutes: Record<string, string> = {
  'reading-ownership': '/period/values/ownership',
  'reading-purpose': '/period/values/purpose',
};
const anchorRoute = (fragment: string) =>
  readingRoutes[fragment] ||
  (fragment === '/period/teaching-order' ? '/' : disciplineAnchorRoute(fragment));
const currentRoute = () => anchorRoute(location.hash.slice(1)) || '/';
// Only a public navigation index enters history. Positions and focus stay in page memory.
export function useRoute() {
  const [path, setPath] = useState(currentRoute);
  const first = useRef(true);
  const restoring = useRef<{ y: number; focus: HTMLElement | null } | null>(null);
  useLayoutEffect(() => {
    let counter = 0;
    let entry = 0;
    const positions = new Map<number, { y: number; focus: HTMLElement | null }>();
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    history.replaceState({ oeNavigation: entry }, '', location.href);
    // Scroll events may arrive after popstate in WebKit. Snapshot the current viewport
    // before changing the rendered route, rather than using a deferred event's value.
    const save = () =>
      positions.set(entry, { y: scrollY, focus: document.activeElement as HTMLElement | null });
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      const link = (event.target as Element).closest<HTMLAnchorElement>('a[href^="#/"]');
      if (!link || link.target || link.hasAttribute('download')) return;
      const fragment = link.getAttribute('href')!.slice(1);
      const next = anchorRoute(fragment);
      if (next === currentRoute()) return;
      event.preventDefault();
      save();
      entry = ++counter;
      restoring.current = null;
      history.pushState({ oeNavigation: entry }, '', '#' + fragment);
      setPath(next);
    };
    const onHistory = () => {
      save();
      const id = history.state?.oeNavigation;
      if (typeof id === 'number') {
        entry = id;
        restoring.current = positions.get(id) || { y: 0, focus: null };
      } else {
        entry = ++counter;
        history.replaceState({ oeNavigation: entry }, '', location.href);
        restoring.current = null;
      }
      setPath(currentRoute());
    };
    document.addEventListener('click', onClick);
    window.addEventListener('popstate', onHistory);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('popstate', onHistory);
      history.scrollRestoration = previousRestoration;
    };
  }, []);
  useLayoutEffect(() => {
    const heading = document.querySelector<HTMLElement>('h1');
    document.title = `${heading?.textContent || 'Page'} | Only Empowerment`;
    const target = document.getElementById(location.hash.slice(1));
    if (target && anchorRoute(location.hash.slice(1)) !== location.hash.slice(1)) {
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: 'start' });
      first.current = false;
      restoring.current = null;
      return;
    }
    if (first.current) {
      first.current = false;
      return;
    }
    const restore = restoring.current;
    if (restore) {
      (restore.focus?.isConnected ? restore.focus : heading)?.focus({ preventScroll: true });
      window.scrollTo(0, restore.y);
      restoring.current = null;
    } else {
      heading?.focus({ preventScroll: true });
      if (
        path === '/period/values' ||
        path === '/period/values/ownership' ||
        path === '/period/values/purpose' ||
        path === '/period/values/resilience' ||
        path === '/period/values/integrity' ||
        path === '/period/values/discipline' ||
        path === '/period/values/empowerment'
      )
        heading?.scrollIntoView({ block: 'start' });
      else window.scrollTo(0, 0);
    }
  }, [path]);
  return path;
}
