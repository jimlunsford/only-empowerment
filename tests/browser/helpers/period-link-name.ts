import { periodValues } from '../../../src/period-content';

export function lessonLinkName(name: string, descriptionVisible = true) {
  const value = periodValues.find((value) => value.name === name);
  if (!value) throw new Error('Unknown PERIOD value: ' + name);
  const position = String(periodValues.indexOf(value) + 1).padStart(2, '0');
  return position + ' ' + name + (descriptionVisible ? ' ' + value.role : '');
}

// The overview and static index use the value alone; full lesson rows also
// contain the visible number and description. Mobile lesson rows hide the description. Accept only these authored names.
export function periodLinkName(name: string) {
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    '^(?:' +
      escape(name) +
      '|' +
      escape(lessonLinkName(name)) +
      '|' +
      escape(lessonLinkName(name, false)) +
      ')$',
  );
}
