import {
  workshopScreens,
  workshopSessionCopy,
  eventCarry,
  workshopOrigin,
  workshopBridges,
} from './execution-workshop-content.ts';
import {
  executionBookUrl,
  executionSections,
  executionTitle,
  type ExecutionBlock,
  type ExecutionText,
  type ExecutionPractice,
} from './execution-content.ts';

// Authored semantic elements only. No HTML parsing, personal data, or stored results.
export type ExecutionNode =
  | string
  | {
      tag:
        | 'article'
        | 'header'
        | 'section'
        | 'nav'
        | 'div'
        | 'h1'
        | 'h2'
        | 'h3'
        | 'h4'
        | 'h5'
        | 'p'
        | 'a'
        | 'ul'
        | 'li'
        | 'blockquote'
        | 'details'
        | 'summary';
      attrs: Record<string, string | number>;
      children: ExecutionNode[];
    };
export type ExecutionSurface = 'app' | 'reading' | 'root' | 'print';
const n = (
  tag: Exclude<ExecutionNode, string>['tag'],
  attrs: Record<string, string | number>,
  ...children: ExecutionNode[]
): ExecutionNode => ({ tag, attrs, children });
const a = (href: string, label: string) => n('a', { href }, label);
const targetId = (id: string, surface: ExecutionSurface) =>
  surface === 'root'
    ? '/execution?section=' + id
    : surface === 'print'
      ? 'execution-print-' + id
      : id;
const localId = (id: string, surface: ExecutionSurface) => 'execution-' + surface + '-' + id;
const sectionHref = (id: string, surface: ExecutionSurface) =>
  surface === 'app' || surface === 'root'
    ? '#/execution?section=' + id
    : '#' + targetId(id, surface);
const readingHref = (id: string) => '/read/execution.html#' + id;
const textNode = (block: ExecutionText): ExecutionNode =>
  block.kind === 'quote'
    ? n('blockquote', { 'data-execution-copy': block.id }, n('p', {}, block.text))
    : n('p', { 'data-execution-copy': block.id }, block.text);

function practiceNode(block: ExecutionPractice, surface: ExecutionSurface): ExecutionNode {
  const titleId = localId(block.id, surface);
  const h3 = surface === 'root' ? 'h4' : 'h3';
  const h4 = surface === 'root' ? 'h5' : 'h4';
  const explanation = (
    kind: 'hint' | 'reasoning',
    label: string,
    blocks: readonly ExecutionText[],
  ) =>
    surface === 'app'
      ? n(
          'details',
          { class: 'execution-disclosure', 'data-explanation': block.id + '-' + kind },
          n('summary', { 'aria-label': label + ': ' + block.title }, label),
          n('div', { class: 'execution-reasoning' }, ...blocks.map(textNode)),
        )
      : n(
          'div',
          { class: 'execution-reasoning', 'data-explanation': block.id + '-' + kind },
          n(h4, {}, kind === 'hint' ? 'Hint' : block.id === 'event' ? 'Discussion' : 'Reasoning'),
          ...blocks.map(textNode),
        );
  return n(
    'section',
    { class: 'execution-practice', 'data-practice': block.id, 'aria-labelledby': titleId },
    n(h3, { id: titleId }, block.title),
    ...block.facts.map(textNode),
    n(
      'p',
      { class: 'execution-question', 'data-execution-copy': block.question.id },
      block.question.text,
    ),
    ...(block.hint ? [explanation('hint', 'Read a hint', [block.hint])] : []),
    explanation(
      'reasoning',
      block.id === 'event' ? 'Read the discussion' : 'Read the reasoning',
      block.reasoning,
    ),
  );
}
function blockNode(block: ExecutionBlock, surface: ExecutionSurface): ExecutionNode {
  if (block.kind === 'practice') return practiceNode(block, surface);
  if (block.kind === 'heading')
    return n(
      surface === 'root' ? 'h4' : 'h3',
      {
        ...(block.target ? { id: targetId(block.target, surface), tabIndex: -1 } : {}),
      },
      block.text,
    );
  return textNode(block);
}
export function workshopTranscript(surface: ExecutionSurface): ExecutionNode {
  const h2 = surface === 'root' ? 'h3' : 'h2';
  const h3 = surface === 'root' ? 'h4' : 'h3';
  const id = (key: string) =>
    surface === 'root'
      ? '/execution/' + key
      : (surface === 'print' ? 'execution-print-workshop-' : 'workshop-') + key;
  return n(
    'section',
    { class: 'execution-workshop-transcript' },
    n(h2, {}, 'Guided workshop: every decision and consequence'),
    n(
      'p',
      {},
      'These situations are illustrations, not events from Jim’s biography. Read in sequence or compare any option. The enhanced workshop presents one screen at a time. This edition includes every branch and explanation.',
    ),
    n('p', {}, workshopSessionCopy),
    n(
      'nav',
      { class: 'execution-contents', 'aria-label': 'Workshop transcript' },
      n(
        'ul',
        {},
        ...workshopScreens.map((screen) => n('li', {}, a('#' + id(screen.id), screen.title))),
      ),
    ),
    ...workshopScreens.map((screen) =>
      n(
        'section',
        { class: 'execution-section', 'data-workshop-transcript': screen.id },
        n(h2, { id: id(screen.id), tabIndex: -1 }, screen.title),
        n('p', {}, screen.purpose),
        n('p', {}, screen.facts),
        ...screen.teaching.map((paragraph) => n('p', {}, paragraph)),
        ...(screen.id === 'event-wait'
          ? ['request', 'polish', 'announce', ''].map((choice) =>
              n('p', {}, eventCarry({ event: choice })),
            )
          : []),
        ...(screen.action
          ? [
              n(h3, {}, 'Demonstrated action'),
              n('p', {}, screen.action.result),
              n('p', {}, screen.action.remains),
            ]
          : []),
        ...(screen.options
          ? [
              n(h3, {}, screen.question!),
              ...screen.options.map((option) =>
                n(
                  'section',
                  {
                    class: 'execution-practice',
                    'data-workshop-option': screen.id + ':' + option.id,
                  },
                  n(h3, {}, option.label),
                  n('p', {}, option.consequence),
                  n('p', {}, option.reasoning),
                  ...(option.next
                    ? [
                        n(
                          'p',
                          {},
                          'Continue to: ' +
                            workshopScreens.find((next) => next.id === option.next)!.title +
                            '.',
                        ),
                      ]
                    : []),
                ),
              ),
              n('p', {}, screen.explanation!),
            ]
          : []),
        ...(screen.id === 'welcome' ? [n('p', {}, workshopOrigin)] : []),
        ...(workshopBridges[screen.id] ? [n('p', {}, workshopBridges[screen.id])] : []),
      ),
    ),
  );
}

export function executionTeaching(surface: ExecutionSurface = 'app'): ExecutionNode {
  const h2 = surface === 'root' ? 'h3' : 'h2';
  return n(
    'article',
    { class: 'execution-experience', 'data-execution-surface': surface },
    n(
      'header',
      { class: 'execution-intro' },
      n(
        surface === 'root' ? 'h2' : 'h1',
        { tabIndex: -1, ...(surface === 'root' ? { id: '/execution' } : {}) },
        executionTitle,
      ),
      n('p', { class: 'execution-author' }, 'By Jim Lunsford'),
      n(
        'div',
        { class: 'execution-entry-links' },
        a(sectionHref('why', surface), 'Read from the beginning'),
        a(sectionHref('reference', surface), 'See the five steps'),
        a('/read/execution.html', 'Read or print the complete experience'),
      ),
    ),
    n(
      'nav',
      { class: 'execution-contents', 'aria-label': 'On this page' },
      n('p', {}, 'On this page'),
      n(
        'ul',
        {},
        ...executionSections.map((section) =>
          n('li', {}, a(sectionHref(section.id, surface), section.title)),
        ),
      ),
    ),
    ...executionSections.map((section) =>
      n(
        'section',
        {
          class: 'execution-section',
          'aria-labelledby': targetId(section.id, surface),
          'data-execution-section': section.id,
        },
        n(
          h2,
          { id: targetId(section.id, surface), tabIndex: -1, 'data-section-heading': section.id },
          section.title,
        ),
        ...section.blocks.map((block) => blockNode(block, surface)),
        ...(section.id === 'continue'
          ? [
              n(
                'nav',
                { class: 'execution-related', 'aria-label': 'Continue the teaching' },
                a(sectionHref('start', surface), 'Revisit Flip the Switch'),
                a(sectionHref('change', surface), 'Continue to changed plans'),
              ),
            ]
          : []),
        ...(['continue', 'transfer'].includes(section.id)
          ? [
              n(
                'p',
                { class: 'execution-reading-link' },
                a(readingHref(section.id), 'Read every explanation'),
              ),
            ]
          : []),
        ...(section.id === 'reference'
          ? [
              n(
                'nav',
                { class: 'execution-related', 'aria-label': 'Return to an explanation' },
                a(sectionHref('hesitation', surface), 'A missing fact or another delay'),
                a(sectionHref('change', surface), 'When the plan needs to change'),
                a(sectionHref('miss', surface), 'Return after a genuine miss'),
              ),
              n(
                'p',
                { class: 'execution-source' },
                a(executionBookUrl, "Visit Jim Lunsford's book page"),
              ),
              n(
                'p',
                { class: 'execution-related' },
                a(surface === 'app' ? '#/' : '/read/index.html', 'Choose another framework'),
              ),
            ]
          : []),
      ),
    ),
    ...(surface !== 'app' ? [workshopTranscript(surface)] : []),
  );
}
