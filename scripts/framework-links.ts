import { frameworkAuthor, frameworkChoices } from '../src/framework-navigation.ts';
const escape = (s: string) =>
  s.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export function frameworkChooser() {
  return `<p class="framework-author">${frameworkAuthor.map(escape).join('<br>')}</p><nav class="framework-chooser" aria-label="Start here if"><h2>Start here if...</h2><ul>${frameworkChoices.map((item) => `<li><a href="${item.reading}">${escape(item.situation)} <span>${escape(item.title)}</span></a></li>`).join('')}</ul></nav>`;
}
export function frameworkBridges(current: string) {
  return `<section class="framework-bridges" aria-label="Where to go next"><h2>Where to go next</h2><ul>${frameworkChoices
    .filter((item) => item.id !== current)
    .map(
      (item) =>
        `<li><a href="${item.reading}">${escape(item.title)}</a>: ${escape(item.situation)}</li>`,
    )
    .join('')}</ul><a href="/read/index.html">Choose another framework</a></section>`;
}
