import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import {
  workshopScreens,
  workshopHref,
  legacyWorkshopMap,
  workshopSessionCopy,
  eventCarry,
} from '../src/execution-workshop-content.ts';
import { executionHomeCopy, executionPrivacyCopy } from '../src/execution-content.ts';
const folder = 'docs/work82';
mkdirSync(folder, { recursive: true });
const escape = (value: string) => '"' + value.replaceAll('"', '""') + '"';
let copy =
  '# Final Work 82 workshop teaching\n\nGenerated from the application content. Every situation is an illustration. No manuscript is reproduced in this review file.\n\n' +
  workshopSessionCopy +
  '\n';
let map =
  '# Screen and decision map\n\nAll addresses are public navigation only. No choice enters a URL.\n\n| Screen | Stage | Purpose | Decisions / continuation |\n| --- | --- | --- | --- |\n';
let csv = 'screen,field,authorship,work80_source_rows,work80_block_ids,implementation\n';
for (const screen of workshopScreens) {
  map += `| [${screen.title}](${workshopHref(screen.id)}) | ${screen.stage || 'Entry/reference'} | ${screen.purpose} | ${screen.options ? screen.options.map((o) => o.id + (o.next ? ' → ' + o.next : '')).join('; ') : screen.action ? 'Reveal action and remaining responsibility' : 'Read / compare'}; Continue: ${screen.next || 'all frameworks'} |\n`;
  copy += `\n## ${screen.title}\n\nAddress: \`${workshopHref(screen.id)}\`\n\n${screen.purpose}\n\n${screen.facts}\n\n${screen.teaching.join('\n\n')}\n`;
  const fields = ['purpose', 'facts', ...screen.teaching.map((_, i) => 'teaching.' + i)];
  if (screen.action) {
    copy += `\n**${screen.action.label}**\n\n${screen.action.result}\n\nWhat remains: ${screen.action.remains}\n`;
    fields.push('action.label', 'action.result', 'action.remains');
  }
  if (screen.id === 'event-wait') {
    copy +=
      '\n### Context carried from the first decision\n\n' +
      ['request', 'polish', 'announce', ''].map((event) => eventCarry({ event })).join('\n\n') +
      '\n';
    fields.push('eventCarry');
  }
  if (screen.options) {
    copy += `\n### ${screen.question}\n`;
    for (const option of screen.options) {
      copy += `\n**${option.label}**\n\nConsequence: ${option.consequence}\n\nReasoning: ${option.reasoning}\n${option.next ? '\nContinue: ' + option.next + '\n' : ''}`;
      fields.push(
        'options.' + option.id + '.label',
        'options.' + option.id + '.consequence',
        'options.' + option.id + '.reasoning',
      );
    }
    copy += '\n### Complete explanation\n\n' + screen.explanation + '\n';
    fields.push('question', 'explanation');
  }
  for (const field of fields)
    csv +=
      [
        screen.id,
        field,
        'educational adaptation; authored illustration where situational',
        screen.sources.join(' '),
        screen.baseline.join(' '),
        'src/execution-workshop-content.ts#' + screen.id,
      ]
        .map(escape)
        .join(',') + '\n';
}
copy +=
  '\n## Additional interface teaching\n\nJim developed this teaching through rebuilding ordinary life after addiction and leading recovery groups. These situations are illustrations, not accounts of his life.\n\nContinue rejoins the example after the set is checked and any unsupported claim is corrected. This is an authored continuation, not a claim that your earlier choice did that work.\n\nThe next scene assumes the owner replies and agrees to four, then changes that arrangement. Every choice can continue.\n\nThe next scene follows an agreed alternative reached through the permitted message route. If your choice left that unresolved, this is where the illustration reconnects after that work is done.\n';
writeFileSync(folder + '/complete-workshop.md', copy);
writeFileSync(folder + '/screen-map.md', map);
writeFileSync(folder + '/source-map.csv', csv);
const old = execFileSync(
  'git',
  ['show', 'd54260c85e94e8391aa51896dd7425693a544766:src/execution-content.ts'],
  { encoding: 'utf8' },
);
const previous = (key: string) =>
  new RegExp('export const ' + key + " =\\n  '([^']+)';").exec(old)![1];
let shared =
  '# Exact shared copy and route changes\n\nOnly these shared strings change. All other existing shared copy and navigation labels remain unchanged.\n\n| Location | Before | After |\n| --- | --- | --- |\n';
shared += `| Home framework description, \`executionHomeCopy\` | ${previous('executionHomeCopy')} | ${executionHomeCopy} |\n`;
shared += `| Enhanced and native privacy paragraph, \`executionPrivacyCopy\` | ${previous('executionPrivacyCopy')} | ${executionPrivacyCopy} |\n`;
shared +=
  '| Native reader return link | Pure Execution Mode with optional explanations | Open the guided workshop |\n';
shared +=
  "| Native reader note | Complete reading edition. Every hint and explanation is visible. Use your browser's Print command for paper or PDF. No scripts or answers are required. | Complete reading edition. The accepted teaching and every workshop choice, consequence and explanation are visible. Use your browser's Print command for paper or PDF. No scripts or answers are required. |\n";
shared +=
  '\n## Existing destinations\n\n`#/execution` opens the workshop entry. `/read/execution.html` and every existing native fragment remain unchanged and complete. The root fallback retains all old native aliases.\n\n| Existing section URL | Related workshop screen | Original full reading |\n| --- | --- | --- |\n';
for (const [old, id] of Object.entries(legacyWorkshopMap))
  shared += `| \`#/execution?section=${old}\` | \`${workshopHref(id)}\` | \`/read/execution.html#${old}\` |\n`;
shared +=
  '\nThe old URL is preserved in the address bar, and the screen explicitly explains its mapping with a link to the full original section. New screens use `#/execution/ID`; `#/execution/welcome` also resolves to entry. Unknown or malformed destinations use the existing not-found page. No server paths, Nginx allowances or TLS changes are required. Native workshop transcript anchors use `/read/execution.html#workshop-ID`; root no-script aliases use `#/execution/ID`.\n';
writeFileSync(folder + '/shared-copy-and-routes.md', shared);
// This script writes review documents only; production generation is separate.
void readFileSync;
