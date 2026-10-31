import {
  practiceViews,
  practiceCopy as c,
  communicationConditions,
  evidenceRecords,
  honestMessage,
  helpMessage,
  type Communication,
} from '../src/period-practice-content.ts';
import { purposeOwnershipHandoff } from '../src/period-purpose-content.ts';

// Fixed, approved editorial content only. No runtime controls or private draft input.
export function practiceFallback() {
  const escape = (text: string) =>
    text
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;');
  const p = (text: string) => `<p>${escape(text)}</p>`;
  const heading = (text: string, level = 3) => `<h${level}>${escape(text)}</h${level}>`;
  const view = (index: number) =>
    heading(practiceViews[index].title, 2) + p(practiceViews[index].lead);
  return `<section aria-label="Practice Ownership linear reading">
    ${view(0)}${p(c.fictional)}${p('The interactive controls need JavaScript. Both situations and all explanations are available below.')}
    ${heading(c.situationHeading)}${p(c.limit)}
    ${Object.values(communicationConditions)
      .map(
        (condition) =>
          heading(condition.label) +
          p(condition.situation) +
          heading('Outside your control', 4) +
          p(condition.outside) +
          heading('Yours to choose now', 4) +
          p(condition.own),
      )
      .join('')}
    ${p(c.reflection)}${p(c.situationClose)}
    ${view(1)}${p(c.responsePause)}${p(c.assumptions)}
    ${Object.entries(communicationConditions)
      .map(
        ([id, condition]) =>
          heading(`${c.honestTitle}: ${condition.label}`) +
          p(honestMessage(id as Communication)) +
          p(condition.explanation) +
          p(c.honestLimit),
      )
      .join('')}
    ${[c.waiting, c.overpromising].map((response) => heading(response.title) + p(response.message) + p(response.explanation)).join('')}
    ${heading(c.help.title)}${Object.entries(communicationConditions)
      .map(([id, condition]) => heading(condition.label, 4) + p(helpMessage(id as Communication)))
      .join('')}${p(c.help.explanation)}${p(c.responseClose)}
    ${view(2)}${p(c.workedExample)}${p(c.assumptions)}${p('The honest-update wording follows the communication condition explained above.')}
    <ol>${c.timeline.map((row) => `<li>${heading(row.when)}${p(row.action)}${p(`If carried out: ${row.evidence}`)}</li>`).join('')}</ol>
    ${heading(c.evidenceLabel)}${p(c.evidenceContext)}
    ${Object.entries(evidenceRecords)
      .map(
        ([id, record]) =>
          heading(record.label) +
          p(record.record) +
          p(record.interpretation) +
          (id === 'missed' ? p(c.repair) : ''),
      )
      .join('')}
    ${p(c.evidenceReflection)}${heading(c.household.title)}${p(c.household.situation)}${heading(c.household.disclosure, 4)}${p(c.household.response)}${p(c.household.explanation)}${p(c.household.agreement)}${p(c.evidenceClose)}
    ${view(3)}${p(c.connectedOpening)}${p(c.connectedStandard)}
    <ol>${c.relationships.map((row) => `<li>${heading(row.value)}${p(row.contribution)}${p(row.connection)}</li>`).join('')}</ol>
    ${p(c.connectedReturn)}${p(c.empowermentLimit)}${p(c.availability)}${heading(c.takeActionHeading)}${p(c.takeAction)}${p(purposeOwnershipHandoff)}<a href="#reading-purpose">Continue to Purpose</a>${heading('A reminder is optional')}${p(c.cardNote)}
  </section>`;
}
