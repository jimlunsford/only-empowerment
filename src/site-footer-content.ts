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
export function footerEducation() {
  return { text: periodExercise.source, url: periodBook.url };
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
