// Optional reading navigation only. Teaching, links and printing work without it.
(() => {
  let revision = 0;
  const cancelPending = () => revision++;
  const pageReady =
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise((resolve) => window.addEventListener('load', resolve, { once: true }));

  const alignFragment = () => {
    const current = ++revision;
    const hash = location.hash;
    let target;
    try {
      target = document.getElementById(decodeURIComponent(hash.slice(1)));
    } catch {
      return;
    }
    if (!target || !hash) return;
    const heading =
      target.id === 'main' || target.matches('h1,h2,h3,h4,h5,h6')
        ? target
        : target.closest('h1,h2,h3,h4,h5,h6') ||
          target.querySelector('h1,h2,h3,h4,h5,h6') ||
          target;
    if (!heading.hasAttribute('tabindex')) heading.tabIndex = -1;
    const align = () => {
      if (current !== revision || location.hash !== hash || !heading.isConnected) return;
      heading.focus({ preventScroll: true });
      heading.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    align();
    // Initial layout discovers the needed fonts. Recheck after fonts and document
    // resources settle, without moving a reader who has already taken control.
    void Promise.all([pageReady, document.fonts.ready]).then(() => {
      requestAnimationFrame(() => requestAnimationFrame(align));
    });
  };

  for (const event of ['pointerdown', 'keydown', 'wheel', 'touchstart'])
    document.addEventListener(event, cancelPending, { passive: true });
  window.addEventListener('pagehide', cancelPending);
  window.addEventListener('hashchange', alignFragment);
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return;
    const menu = document.querySelector('.site-menu[open]');
    if (!menu) return;
    event.preventDefault();
    menu.open = false;
    menu.querySelector('summary')?.focus();
  });
  alignFragment();
})();
