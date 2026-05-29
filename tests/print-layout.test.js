const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const printCss = fs.readFileSync(path.join(root, 'print.css'), 'utf8');

function includesAll(source, tokens, label) {
  for (const token of tokens) {
    assert(
      source.includes(token),
      `${label} is missing expected print layout token: ${token}`
    );
  }
}

includesAll(printCss, [
  '--a4lp-accent:',
  '--a4lp-paper:',
  'border-top: 2px solid var(--a4lp-accent)',
  'text-align: justify',
  'hyphens: auto',
  'background: var(--a4lp-paper)',
  'font-variant-numeric: tabular-nums',
], 'print.css');

console.log('print layout contract ok');
