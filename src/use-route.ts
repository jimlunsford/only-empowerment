import { useLayoutEffect, useRef, useState } from 'preact/hooks';
import { homepageAnchors } from './period-homepage-content';
import { disciplineAnchorRoute } from './period-discipline-navigation';
// The root fallback contains these reading anchors when scripts are unavailable.
// With scripts running, the same ordinary links open their complete app lessons.
const readingRoutes: Record<string, string> = {
  'reading-ownership': '/period/values/ownership',
  'reading-ownership-practice': '/period/practice',
  'reading-ownership-responses': '/period/practice/responses',
  'reading-ownership-follow-through': '/period/practice/follow-through',
  'reading-ownership-connected-code': '/period/practice/connected-code',
  'reading-purpose': '/period/values/purpose',
  'reading-standard-card': '/period/standard',
};
// One URL fragment holds both the hash route and the optional authored section ID.
const rebuildSection = /^(\/rebuild\/[a-z]+)\?section=([a-z][a-z0-9-]*)$/;
const anchorRoute = (fragment: string) =>
  Object.hasOwn(readingRoutes, fragment)
    ? readingRoutes[fragment]
    : Object.hasOwn(homepageAnchors, fragment) ||
        Object.values(homepageAnchors).some((native) => native === fragment)
      ? '/period'
      : rebuildSection.exec(fragment)?.[1] || disciplineAnchorRoute(fragment);
const anchorTarget = (fragment: string) => {
  const section = rebuildSection.exec(fragment)?.[2];
  if (section) {
    const target = document.querySelector<HTMLElement>('#app .rebuild-guide #' + section);
    if (target) target.tabIndex = -1;
    return target;
  }
  const appAnchor = Object.entries(homepageAnchors).find(([, native]) => native === fragment)?.[0];
  return document.getElementById(appAnchor || fragment);
};
// Only a public navigation index enters history. Positions and focus stay in page memory.
export function useRoute() {
  const [fragment, setFragment] = useState(() => location.hash.slice(1));
  const path = anchorRoute(fragment) || '/';
  const first = useRef(true);
  const restoring = useRef<{ y: number; focus: HTMLElement | null } | null>(null);
  useLayoutEffect(() => {
    let entry = Number.isSafeInteger(history.state?.oeNavigation)
      ? Number(history.state.oeNavigation)
      : 0;
    let counter = entry;
    const positions = new Map<number, { y: number; focus: HTMLElement | null }>();
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    history.replaceState({ oeNavigation: entry }, '', location.href);
    // Scroll events may arrive after popstate in WebKit. Snapshot the current viewport
    // before changing the rendered route, rather than using a deferred event's value.
    const save = (focus = document.activeElement as HTMLElement | null) =>
      positions.set(entry, { y: scrollY, focus });
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
      if (fragment === location.hash.slice(1)) {
        event.preventDefault();
        const target = anchorTarget(fragment);
        target?.focus({ preventScroll: true });
        target?.scrollIntoView({ block: 'start' });
        return;
      }
      event.preventDefault();
      save(link);
      entry = ++counter;
      restoring.current = null;
      history.pushState({ oeNavigation: entry }, '', '#' + fragment);
      setFragment(fragment);
    };
    const onHistory = () => {
      save();
      const id = history.state?.oeNavigation;
      if (typeof id === 'number') {
        entry = id;
        restoring.current = positions.get(id) || null;
      } else {
        entry = ++counter;
        history.replaceState({ oeNavigation: entry }, '', location.href);
        restoring.current = null;
      }
      setFragment(location.hash.slice(1));
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
    const target = anchorTarget(location.hash.slice(1));
    if (
      !restoring.current &&
      target &&
      anchorRoute(location.hash.slice(1)) !== location.hash.slice(1)
    ) {
      // Font loading can change the target's position after the initial render.
      // Measure to start font layout, then align focus and scroll to its final position.
      target.getBoundingClientRect();
      let cancelled = false;
      const alignTarget = () => {
        if (cancelled) return;
        target.focus({ preventScroll: true });
        target.scrollIntoView({ block: 'start' });
      };
      if (document.fonts.status === 'loading') void document.fonts.ready.then(alignTarget);
      else alignTarget();
      first.current = false;
      restoring.current = null;
      return () => {
        cancelled = true;
      };
    }
    if (first.current) {
      first.current = false;
      return;
    }
    const restore = restoring.current;
    if (restore) {
      // A cross-route link can be unmounted. Recover its public destination on the restored page.
      const oldLink = restore.focus;
      const replacement =
        oldLink instanceof HTMLAnchorElement && rebuildSection.test(oldLink.hash.slice(1))
          ? Array.from(document.querySelectorAll<HTMLAnchorElement>('.rebuild-guide a[href]')).find(
              (link) => link.href === oldLink.href,
            )
          : null;
      (oldLink?.isConnected ? oldLink : replacement || target || heading)?.focus({
        preventScroll: true,
      });
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
  }, [path, fragment]);
  return path;
}
