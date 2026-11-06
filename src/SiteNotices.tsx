import {
  founderLinks,
  footerEducation,
  footerBuildNotice,
  type FooterBuild,
} from './site-footer-content';

export function SiteNotices({ build }: { build: FooterBuild }) {
  const state = footerBuildNotice(build),
    education = footerEducation();
  return (
    <div class="footer-provenance footer-notices">
      <p class="founder-copyright">
        Copyright © <a href={founderLinks.author}>Jim Lunsford</a>. All rights reserved. A{' '}
        <a href={founderLinks.company}>Phoenix 2:33 LLC</a> Project.
      </p>
      <div class="footer-print-urls">
        <p>
          {education.text} <a href={education.url}>{education.url}</a>
        </p>
        <p>
          Software: <a href="https://www.gnu.org/licenses/agpl-3.0.html">AGPL-3.0-or-later</a>. No
          warranty.
        </p>
        {state.source && (
          <p>
            Corresponding source: <a href={state.source}>{state.source}</a>
          </p>
        )}
      </div>
    </div>
  );
}
