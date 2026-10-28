import { useLayoutEffect, useRef, useState } from 'preact/hooks';
const currentRoute = () => location.hash.slice(1) || '/';
// Only a public navigation index enters history. Positions and focus stay in page memory.
export function useRoute() {
  const [path, setPath] = useState(currentRoute);
  const first = useRef(true);
  const restoring = useRef<{ y: number; focus: HTMLElement | null } | null>(null);
  useLayoutEffect(() => {
    let counter = 0;
    let entry = 0;
    let latestY = scrollY;
    const positions = new Map<number, { y: number; focus: HTMLElement | null }>();
    const previousRestoration = history.scrollRestoration;
    history.scrollRestoration = 'manual';
    history.replaceState({ oeNavigation: entry }, '', location.href);
    const save = () =>
      positions.set(entry, { y: latestY, focus: document.activeElement as HTMLElement | null });
    const onScroll = () => {
      latestY = scrollY;
    };
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
      const next = link.getAttribute('href')!.slice(1);
      if (next === currentRoute()) return;
      event.preventDefault();
      save();
      entry = ++counter;
      restoring.current = null;
      history.pushState({ oeNavigation: entry }, '', '#' + next);
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
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('popstate', onHistory);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('popstate', onHistory);
      history.scrollRestoration = previousRestoration;
    };
  }, []);
  useLayoutEffect(() => {
    const heading = document.querySelector<HTMLElement>('h1');
    document.title = `${heading?.textContent || 'Page'} | Only Empowerment`;
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
      window.scrollTo(0, 0);
    }
  }, [path]);
  return path;
}
