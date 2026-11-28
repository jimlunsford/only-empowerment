// Both surfaces share the same links. CSS exposes only one navigation at a time.
// Native details supplies the mobile control even when JavaScript is unavailable.
export function withReadingNavigation(html: string) {
  return html
    .replace("default-src 'none';", "default-src 'none'; script-src 'self';")
    .replace(
      '</head>',
      '<link rel="icon" href="/favicon.svg"><script defer src="/read/navigation.js"></script></head>',
    );
}
export function withDesktopNavigation(html: string) {
  return withReadingNavigation(html).replace(
    /(<details class="site-menu"><summary>Menu<\/summary>)([\s\S]*?)(<\/details>)/,
    '$1$2$3<div class="desktop-navigation">$2</div>',
  );
}
