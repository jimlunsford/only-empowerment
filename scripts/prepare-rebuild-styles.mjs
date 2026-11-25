// Work 53 CSS source -> namespaced app styles.
// The unmodified original remains in docs/work53-source/field-guide.css.
import { readFileSync, writeFileSync } from 'node:fs';
import postcss from 'postcss';
const input = readFileSync('docs/work53-source/field-guide.css', 'utf8');
const root = postcss.parse(input);
root.walkAtRules('page', (atRule) => atRule.remove());
root.walkRules((rule) => {
  rule.selector = rule.selector
    .split(',')
    .map((selector) => {
      const trimmed = selector.trim();
      return trimmed === ':root' || trimmed === 'body'
        ? '.rebuild-guide'
        : '.rebuild-guide ' + trimmed;
    })
    .join(', ');
});
writeFileSync('src/rebuild-source-scoped.css', root.toString() + '\n');
console.log('Work 53 original CSS scoped, original bytes=' + input.length);
