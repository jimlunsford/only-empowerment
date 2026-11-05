import {
  founderLinks,
  softwareNotice,
  footerEducation,
  footerBuildNotice,
  type FooterBuild,
} from './site-footer-content';

export function SiteNotices({ build, path }: { build: FooterBuild; path: string }) {
  const state = footerBuildNotice(build),
    education = footerEducation(path);
  return (
    <div class="footer-provenance footer-notices">
      <p class="founder-copyright">
        Copyright © <a href={founderLinks.author}>Jim Lunsford</a>. All rights reserved. A{' '}
        <a href={founderLinks.company}>Phoenix 2:33 LLC</a> Project.
      </p>
      <p class="footer-software">
        {softwareNotice.copyright}
        <a href="/LICENSE.txt">{softwareNotice.license}</a>
        {softwareNotice.permissions}
      </p>
      <p class="footer-education">
        {education.text}{' '}
        <span class="footer-education-url">
          <a href={education.url}>{education.url}</a>
        </span>
      </p>
      <div class="footer-meta">
        <p>
          {state.text}
          {state.source && (
            <>
              {' '}
              · <a href={state.source}>Corresponding source for this build</a>
            </>
          )}
        </p>
      </div>
      <div class="footer-print-urls">
        <p>
          <a href={founderLinks.author}>{founderLinks.author}</a>
          <br />
          <a href={founderLinks.company}>{founderLinks.company}</a>
        </p>
        {state.source && (
          <p>
            Corresponding source: <a href={state.source}>{state.source}</a>
          </p>
        )}
        <p>
          <a href="https://www.gnu.org/licenses/agpl-3.0.html">
            https://www.gnu.org/licenses/agpl-3.0.html
          </a>
        </p>
      </div>
    </div>
  );
}
