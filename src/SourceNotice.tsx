import { footerBuildNotice, softwareNotice, type FooterBuild } from './site-footer-content';

export function SourceNotice({ build }: { build: FooterBuild }) {
  const state = footerBuildNotice(build);
  return (
    <section class="source-information">
      <h2>Inspect the source</h2>
      <p>
        This page identifies the corresponding source for this build. Public source helps you
        inspect intended behavior; a commit label alone does not prove the delivered files match it.
        Build metadata and file checksums remain available for deployment verification.
      </p>
      <p>
        {softwareNotice.copyright}
        <a href="/LICENSE.txt">{softwareNotice.license}</a>
        {softwareNotice.permissions}
      </p>
      {state.source ? (
        <p>
          <a href={state.source} rel="noreferrer">
            Corresponding source for this build
          </a>
        </p>
      ) : (
        <p>{state.text}</p>
      )}
      <p>
        <a href="/read/privacy.html">Read Privacy &amp; source without JavaScript</a>.{' '}
        <a href="/THIRD_PARTY_NOTICES.txt">Third-party notices</a>.
      </p>
    </section>
  );
}
