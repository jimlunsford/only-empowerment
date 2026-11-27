import { loopRestartPaths, type LoopBreak } from './loop-practice-content.ts';
import { frameworkChoices } from './framework-navigation.ts';
import { loopBookUrl, loopSections, loopStages, loopTransfer } from './loop-content.ts';
import { loopScenario, type LoopStateId, type LoopState } from './loop-practice-content.ts';

// Small fixed semantic nodes, shared by Preact and the build-time native reader.
// This tree contains authored content only, never parsed HTML or visitor data.
export type LoopNode =
  | string
  | {
      tag:
        | 'div'
        | 'section'
        | 'header'
        | 'nav'
        | 'aside'
        | 'article'
        | 'h1'
        | 'h2'
        | 'h3'
        | 'h4'
        | 'p'
        | 'a'
        | 'ol'
        | 'ul'
        | 'li'
        | 'span'
        | 'strong';
      attrs: Record<string, string | number>;
      children: LoopNode[];
    };
export type LoopSurface = 'app' | 'reading' | 'root';
export const node = (
  tag: Exclude<LoopNode, string>['tag'],
  attrs: Record<string, string | number>,
  ...children: LoopNode[]
): LoopNode => ({ tag, attrs, children });
const paragraph = (text: string) => node('p', {}, text);
const anchor = (href: string, text: string) => node('a', { href }, text);
const sectionHref = (id: string, surface: LoopSurface) =>
  surface === 'reading' ? '#' + id : '#/loop?section=' + id;
const sectionId = (id: string, surface: LoopSurface) =>
  surface === 'root' ? '/loop?section=' + id : id;
const practiceHref = (surface: LoopSurface, miss = false) =>
  surface === 'app'
    ? '#/loop/practice' + (miss ? '?state=miss' : '')
    : '/read/loop-practice.html' + (miss ? '#loop-state-miss' : '');

export function loopCycle(surface: LoopSurface): LoopNode {
  return node(
    'aside',
    { class: 'loop-cycle', 'aria-label': 'The reinforcement cycle' },
    node('p', { class: 'loop-kicker' }, 'One cycle. The next choice.'),
    node(
      'ol',
      {},
      ...loopStages.map((stage, i) =>
        node('li', {}, anchor(sectionHref('part-' + (i + 1), surface), stage)),
      ),
    ),
    node(
      'p',
      { class: 'loop-cycle-return' },
      node('strong', {}, 'Back to the next pressure point.'),
      ' More evidence behind the next aligned action. The cycle repeats.',
    ),
  );
}

export function loopTeaching(surface: LoopSurface = 'app'): LoopNode {
  const h2 = surface === 'root' ? 'h3' : 'h2';
  const h3 = surface === 'root' ? 'h4' : 'h3';
  return node(
    'div',
    { class: 'loop-experience', ...(surface === 'root' ? { id: '/loop' } : {}) },
    node(
      'header',
      { class: 'loop-hero' },
      node(
        'div',
        {},
        node(surface === 'root' ? 'h2' : 'h1', { tabIndex: -1 }, 'The Discipline Loop'),
        paragraph('By Jim Lunsford'),
        node('p', { class: 'loop-deck' }, 'Build proof when pressure returns.'),
        node(
          'div',
          { class: 'loop-actions' },
          anchor(sectionHref('five-parts', surface), 'Understand the loop'),
          anchor(practiceHref(surface), 'Try a pressure point'),
          anchor('/read/loop.html', 'Read or print the complete experience'),
        ),
      ),
      loopCycle(surface),
    ),
    node(
      'nav',
      { class: 'loop-section-nav', 'aria-label': 'Explore this framework' },
      ...[
        ['desire', 'Desire & proof'],
        ['five-parts', 'Five parts'],
        ['two-loops', 'Two loops'],
        ['recovery', 'Recovery'],
        ['breaks', 'Common breaks'],
        ['restart', 'Restart'],
        ['source', 'The source'],
      ].map(([id, label]) => anchor(sectionHref(id, surface), label)),
    ),
    ...loopSections.map((section) =>
      node(
        'section',
        { class: 'loop-section', 'aria-labelledby': 'loop-title-' + section.id },
        node(
          h2,
          { id: sectionId(section.id, surface), tabIndex: -1 },
          node('span', { id: 'loop-title-' + section.id }, section.title),
        ),
        ...section.blocks.map((block) => {
          if (block.kind === 'heading')
            return node(
              h3,
              { ...(block.id ? { id: sectionId(block.id, surface), tabIndex: -1 } : {}) },
              block.text,
            );
          if (block.kind === 'comparison')
            return node(
              'div',
              { class: 'loop-comparisons' },
              ...block.rows.map((row) =>
                node(
                  'section',
                  { class: 'loop-comparison-row' },
                  node(h3, {}, row[0]),
                  node(
                    'div',
                    { class: 'loop-comparison-pair' },
                    node('div', {}, node('strong', {}, 'Escape and relief'), paragraph(row[1])),
                    node(
                      'div',
                      {},
                      node('strong', {}, 'Discipline Loop response'),
                      paragraph(row[2]),
                    ),
                  ),
                ),
              ),
            );
          if (block.related) {
            return node(
              'p',
              {},
              block.text + ' ',
              anchor(
                surface === 'app' ? block.related.app : block.related.reading,
                block.related.label,
              ),
            );
          }
          if (block.executionLink) {
            const label = 'Pure Execution Mode';
            const index = block.text.lastIndexOf(label);
            return node(
              'p',
              {},
              block.text.slice(0, index),
              anchor(surface === 'app' ? '#/execution' : '/read/execution.html', label),
              block.text.slice(index + label.length),
            );
          }
          if (section.id === 'frameworks') {
            const sibling = frameworkChoices.find(
              (item) => item.id !== 'loop' && block.text.includes(item.title),
            );
            if (sibling) {
              const index = block.text.indexOf(sibling.title);
              return node(
                'p',
                {},
                block.text.slice(0, index),
                anchor(surface === 'app' ? '#/' + sibling.id : sibling.reading, sibling.title),
                block.text.slice(index + sibling.title.length),
              );
            }
          }
          return paragraph(block.text);
        }),
        ...(section.id === 'restart'
          ? [
              node(
                'div',
                { class: 'loop-actions' },
                anchor(practiceHref(surface, true), 'Try the restart example'),
                anchor(sectionHref('five-parts', surface), 'Return to the five parts'),
              ),
            ]
          : []),
        ...(section.id === 'next-pressure'
          ? [
              node(
                'div',
                { class: 'loop-actions' },
                anchor(practiceHref(surface), 'Try another choice'),
                anchor(surface === 'app' ? '#/' : '/read/index.html', 'Explore the frameworks'),
              ),
            ]
          : []),
        ...(section.id === 'source'
          ? [
              paragraphLink(loopBookUrl, "Visit Jim Lunsford's book page"),
              node(
                'section',
                { class: 'framework-bridges', 'aria-label': 'Where to go next' },
                node(h2, {}, 'Where to go next'),
                node(
                  'ul',
                  {},
                  ...frameworkChoices
                    .filter((item) => item.id !== 'loop')
                    .map((item) =>
                      node(
                        'li',
                        {},
                        anchor(surface === 'app' ? '#/' + item.id : item.reading, item.title),
                        ': ' + item.situation,
                      ),
                    ),
                ),
                anchor(surface === 'app' ? '#/' : '/read/index.html', 'Choose another framework'),
              ),
            ]
          : []),
      ),
    ),
    node(
      'section',
      { class: 'loop-section loop-transfer', 'aria-labelledby': 'loop-transfer-title' },
      node(h2, { id: 'loop-transfer-title' }, loopTransfer.heading),
      paragraph(loopTransfer.optional),
      paragraph(loopTransfer.scenario),
      paragraph(loopTransfer.reflection),
    ),
  );
}
const paragraphLink = (href: string, text: string) => node('p', {}, anchor(href, text));

export function loopTrace(state: LoopState, heading: 'h3' | 'h4' = 'h3'): LoopNode[] {
  if (!state.loop) return [];
  return [
    node(
      'div',
      { class: 'loop-trace' },
      node(heading, {}, 'What this response reinforces'),
      node(
        'ol',
        {},
        ...state.loop.map((part) => node('li', {}, node('strong', {}, part.stage), ' ', part.text)),
      ),
    ),
  ];
}
export function loopTranscript(surface: LoopSurface = 'reading'): LoopNode {
  return node(
    'section',
    {
      class: 'loop-transcript',
      ...(surface === 'root' ? { id: '/loop/practice' } : {}),
      'aria-label': 'Every choice and consequence',
    },
    node(surface === 'root' ? 'h3' : 'h2', {}, 'Every choice and consequence'),
    ...loopScenario.intro.map(paragraph),
    ...Object.entries(loopScenario.states).map(([id, state]) =>
      node(
        'article',
        { id: 'loop-state-' + id, class: 'loop-transcript-state' },
        node(
          surface === 'root' ? 'h4' : 'h3',
          {
            tabIndex: -1,
            ...(surface === 'root' && id === 'miss' ? { id: '/loop/practice?state=miss' } : {}),
          },
          state.heading,
        ),
        ...state.body.map(paragraph),
        ...(id === 'restart'
          ? Object.values(loopRestartPaths).flatMap((path) => [
              node('h4', {}, path.label),
              paragraph(path.fact),
              paragraph(path.action),
            ])
          : []),
        ...loopTrace(state, 'h4'),
        paragraph('Possible next choices'),
        node(
          'ul',
          {},
          ...state.options.map((option) =>
            node(
              'li',
              {},
              anchor('#loop-state-' + option.next, option.label),
              ' → ' + loopScenario.states[option.next].heading,
            ),
          ),
        ),
      ),
    ),
  );
}

export function loopStateContent(id: LoopStateId, path?: LoopBreak): LoopNode[] {
  const state = loopScenario.states[id];
  const context = id === 'restart' && path ? loopRestartPaths[path] : undefined;
  const body = context ? [context.fact, state.body[1], context.action] : state.body;
  return [...body.map(paragraph), ...loopTrace(state)];
}
