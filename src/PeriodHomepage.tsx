import type { ComponentChildren } from 'preact';
import { homepage as c } from './period-homepage-content';

export function PeriodHomepage({ sequence }: { sequence: ComponentChildren }) {
  return (
    <div class="period-learning homepage">
      <section class="home-hero" aria-labelledby="home-title">
        <h1 id="home-title" tabIndex={-1}>
          {c.titleStart}
          <em>{c.titleEmphasis}</em>
        </h1>
        <div class="home-hero-copy">
          <p class="lead">{c.lead}</p>
          <p>{c.opening}</p>
          <a class="button primary" href="#/period/first-moment">
            {c.start} <span aria-hidden="true">↓</span>
          </a>
        </div>
      </section>
      <section
        id="/period/first-moment"
        class="home-moment home-ruled"
        tabIndex={-1}
        aria-labelledby="home-moment-title"
      >
        <div class="home-columns">
          <h2 id="home-moment-title">{c.moment}</h2>
          <div>
            <p class="home-situation">{c.comparison.situation}</p>
            <p class="home-prompt">{c.notice}</p>
          </div>
        </div>
        <div class="home-comparison">
          <section class="home-negotiation">
            <h3>The negotiation</h3>
            <blockquote>{c.comparison.negotiation}</blockquote>
            <p>{c.comparison.negotiationExplanation}</p>
          </section>
          <section class="home-standard">
            <h3>The standard</h3>
            <blockquote>{c.comparison.standard}</blockquote>
            <p>{c.comparison.standardExplanation}</p>
          </section>
        </div>
        <div class="home-teaching home-columns">
          <div>
            <h3>{c.ownHeading}</h3>
            <p>{c.own}</p>
            <p>{c.connection}</p>
          </div>
          <div>
            <h3>{c.valueHeading}</h3>
            <p>{c.value}</p>
            <p class="home-emphasis">{c.evidence}</p>
          </div>
        </div>
        <div class="home-limits">
          <h3>{c.comparison.disclosure}</h3>
          <p>{c.comparison.adaptation}</p>
        </div>
      </section>
      <section
        class="home-reflection home-columns home-ruled"
        aria-labelledby="home-reflection-title"
      >
        <h2 id="home-reflection-title">{c.reflectionHeading}</h2>
        <div>
          <p class="home-question">{c.reflection}</p>
          <p>{c.privateReflection}</p>
          <p>{c.responsibility}</p>
        </div>
      </section>
      <section
        id="/period/why"
        class="home-meaning home-columns home-ruled"
        tabIndex={-1}
        aria-labelledby="home-why-title"
      >
        <h2 id="home-why-title">
          Why <em>PERIOD?</em>
        </h2>
        <div>
          <p>{c.why}</p>
          <p>{c.connected}</p>
        </div>
      </section>
      <section
        id="/period/teaching-order"
        class="home-values home-ruled"
        tabIndex={-1}
        aria-labelledby="home-values-title"
      >
        <div class="home-columns">
          <h2 id="home-values-title">{c.valuesHeading}</h2>
          <div>
            <p>{c.values}</p>
            <p>{c.order}</p>
          </div>
        </div>
        {sequence}
        <div class="home-continue">
          <a class="button primary" href="#/period/values/ownership">
            {c.continue} <span aria-hidden="true">→</span>
          </a>
          <p>{c.availability}</p>
        </div>
      </section>
      <section class="home-origin home-columns home-ruled">
        <h2>{c.originHeading}</h2>
        <div>
          <p>{c.origin}</p>
          <p class="small">{c.author}</p>
        </div>
      </section>
      <section class="home-book home-columns home-ruled">
        <h2>{c.bookHeading}</h2>
        <div>
          <p>{c.book}</p>
          <a href={c.bookUrl} rel="noreferrer">
            {c.bookLink} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
      <aside class="home-access home-ruled" aria-label="Reading and privacy">
        <p>
          {c.access} <a href="#/privacy">{c.privacy}</a>
          {c.privacyExplanation}
        </p>
      </aside>
    </div>
  );
}
