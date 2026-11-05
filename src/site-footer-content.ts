import { periodExercise, periodBook } from './period-content.ts';

export type FooterBuild = { version: string; commit: string; source: string; dirty: boolean };
export const founderCopyright =
  'Copyright © Jim Lunsford. All rights reserved. A Phoenix 2:33 LLC Project.';
export const founderLinks = {
  author: 'https://jimlunsford.com/',
  company: 'https://phoenix233.com/',
};
export const softwareNotice = {
  copyright: 'Application software: Copyright (C) 2026 Jim Lunsford. Licensed under ',
  license: 'AGPL-3.0-or-later',
  permissions:
    '. You may use, modify, and redistribute it under that license. No warranty. The copyright statement above does not limit these software permissions.',
};
const legacySources: Record<string, { text: string; url: string }> = {
  'decision-room': {
    text: 'Based on The PERIOD Code',
    url: 'https://jimlunsford.com/period-code/',
  },
  'next-move': {
    text: 'Based on Pure Execution Mode',
    url: 'https://jimlunsford.com/pure-execution-mode/',
  },
  'do-it-now': {
    text: 'Based on Pure Execution Mode',
    url: 'https://jimlunsford.com/pure-execution-mode/',
  },
  'build-a-standard': {
    text: 'Based on The PERIOD Code and standards doctrine',
    url: 'https://jimlunsford.com/period-code/',
  },
  reset: {
    text: 'Based on The PERIOD Code, How to Rebuild Yourself, and The Discipline Loop',
    url: 'https://jimlunsford.com/core-frameworks/',
  },
  'rebuild-map': {
    text: 'Based on How to Rebuild Yourself',
    url: 'https://jimlunsford.com/how-to-rebuild-yourself/',
  },
};
export function footerEducation(path = '') {
  const source = legacySources[path.split('/')[2]];
  return source
    ? { ...source, text: `${source.text}. Built by Jim Lunsford.` }
    : { text: periodExercise.source, url: periodBook.url };
}
export function footerBuildNotice(build?: FooterBuild) {
  if (!build)
    return { text: 'Local preview. Exact corresponding source is not identified.', source: null };
  if (build.dirty)
    return {
      text: `v${build.version} · local changes · base ${build.commit.slice(0, 7)}. This local preview includes changes not represented by the base commit; exact corresponding source is not published.`,
      source: null,
    };
  return { text: `v${build.version} · source ${build.commit.slice(0, 7)}`, source: build.source };
}
