import { periodExercise, periodBook } from './period-content.ts';

export type FooterBuild = { version: string; commit: string; source: string; dirty: boolean };
export const founderCopyright =
  'Copyright © Jim Lunsford. Software and educational adaptations: AGPL-3.0-or-later. Published books: all rights reserved. A Phoenix 2:33 LLC Project.';
export const founderLinks = {
  author: 'https://jimlunsford.com/',
  books: 'https://jimlunsford.com/books/',
  company: 'https://phoenix233.com/',
};
export const softwareNotice = {
  copyright:
    'Application software and educational adaptations: Copyright (C) 2026 Jim Lunsford. Licensed under ',
  license: 'AGPL-3.0-or-later',
  permissions:
    '. You may use, modify, and redistribute it under that license. No warranty. Rights reserved in the published books do not limit these software permissions.',
};
export type EducationSource = 'period' | 'rebuild' | 'loop' | 'execution' | 'combined';
export function footerEducation(source: EducationSource) {
  if (source === 'period') return { text: periodExercise.source, url: periodBook.url };
  if (source === 'execution')
    return {
      text: 'An educational companion to Pure Execution Mode by Jim Lunsford.',
      url: 'https://jimlunsford.com/pure-execution-mode/',
    };
  if (source === 'loop')
    return {
      text: 'An educational companion to The Discipline Loop by Jim Lunsford.',
      url: 'https://jimlunsford.com/discipline-loop/',
    };
  const titles =
    source === 'rebuild'
      ? 'How to Rebuild Yourself'
      : 'The PERIOD Code, How to Rebuild Yourself, The Discipline Loop and Pure Execution Mode';
  return {
    text: `An educational companion to ${titles} by Jim Lunsford.`,
    url: null,
  };
}
export function footerBuildNotice(build?: FooterBuild) {
  if (!build)
    return { text: 'Exact corresponding source is not identified for this build.', source: null };
  if (build.dirty)
    return {
      text: `v${build.version} · local changes · base ${build.commit.slice(0, 7)}. This build includes changes not represented by the base commit; exact corresponding source is not published.`,
      source: null,
    };
  return { text: `v${build.version} · source ${build.commit.slice(0, 7)}`, source: build.source };
}
