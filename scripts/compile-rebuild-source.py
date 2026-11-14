#!/usr/bin/env python3
"""Compile Work 53 source main sections to safe Preact node data.

Original guide HTML stays byte-identical in src/rebuild-source.
No runtime HTML evaluation or arbitrary third-party markup is permitted.
"""
import json
from html.parser import HTMLParser
from pathlib import Path

DIRECTORY = Path('docs/work53-source')
PAGES = ('index', 'line', 'structure', 'return', 'trust', 'negotiation', 'help', 'end', 'all')
ALIASES = {'all': 'complete'}
ALLOWED = {
    'p', 'span', 'div', 'a', 'section', 'h4', 'h2', 'nav', 'li', 'article',
    'h3', 'aside', 'strong', 'label', 'input', 'h1', 'header', 'dt', 'dd',
    'details', 'summary', 'small', 'ol', 'fieldset', 'legend', 'dl'
}
ATTRS = {
    'class', 'id', 'href', 'aria-label', 'aria-hidden', 'aria-labelledby',
    'open', 'tabindex', 'type', 'name', 'aria-controls', 'checked'
}
EMPTY = {'input'}

class GuideMain(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_main = False
        self.depth = 0
        self.stack = []
        self.nodes = []
        self.main_count = 0
        self.controls = 0
    def handle_starttag(self, tag, attrs):
        if not self.in_main:
            if tag == 'main':
                if self.main_count:
                    raise ValueError('Duplicate guide main')
                self.in_main = True
                self.main_count += 1
            return
        if tag not in ALLOWED:
            raise ValueError('Unapproved element: '+tag)
        values = {}
        for name,value in attrs:
            if name not in ATTRS:
                raise ValueError('Unapproved HTML attribute: '+name)
            if name in ('open','checked'):
                values[name] = True
            elif name == 'href':
                if value.startswith('#'):
                    values[name] = value
                else:
                    file, *frag = value.split('#')
                    if file != 'all.html' and file not in [p + '.html' for p in PAGES]:
                        raise ValueError('Unapproved guide link: '+value)
                    section = ALIASES.get(file[:-5],file[:-5])
                    values[name] = '#/rebuild/' + section
                    if frag:
                        values['data-rebuild-target'] = frag[0]
            else:
                values[name] = value or ''
        if tag == 'h1': values['tabindex'] = '-1'
        if tag in ('input','details'): self.controls += 1
        node = {'tag':tag, 'attrs':values, 'children':[]}
        (self.stack[-1]['children'] if self.stack else self.nodes).append(node)
        if tag not in EMPTY: self.stack.append(node)
    def handle_endtag(self, tag):
        if not self.in_main: return
        if tag == 'main':
            if self.stack: raise ValueError('Unexpected unclosed guide elements')
            self.in_main = False
            return
        if tag in EMPTY: return
        if not self.stack or self.stack[-1]['tag'] != tag:
            raise ValueError('Mismatched source element: ' + tag)
        self.stack.pop()
    def handle_data(self, value):
        if self.in_main and value:
            (self.stack[-1]['children'] if self.stack else self.nodes).append(value)

all_nodes = {}
checks = {}
for file in PAGES:
    content = (DIRECTORY/(file+'.html')).read_text()
    if '<script' in content.lower() or 'style="' in content.lower():
        raise ValueError('Refuse script or inline styles: '+file)
    parser = GuideMain()
    parser.feed(content)
    if not parser.main_count or parser.in_main:
        raise ValueError('Source main not properly closed: ' + file)
    name = ALIASES.get(file,file)
    all_nodes[name] = parser.nodes
    checks[name] = {'rootNodes':len(parser.nodes),'controls':parser.controls}
out = "/* Generated from exact founder-supplied Work 53 HTML. Do not hand-edit. */\n"
out += 'export const rebuildTrees = ' + json.dumps(all_nodes,ensure_ascii=False,separators=(',',':')) + ' as const;\n'
Path('src/rebuild-content.ts').write_text(out)
print('Compiled Work 53 native content:', json.dumps(checks))
