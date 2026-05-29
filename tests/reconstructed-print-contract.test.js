const assert = require('assert');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const flowJs = fs.readFileSync(path.join(root, 'flow.js'), 'utf8');
const printCss = fs.readFileSync(path.join(root, 'print.css'), 'utf8');

function includes(source, token, label) {
  assert(
    source.includes(token),
    `${label} is missing reconstructed print contract token: ${token}`
  );
}

includes(flowJs, 'buildReconstructedMain', 'flow.js');
includes(flowJs, 'isSupplementalNode(from)', 'flow.js');
includes(flowJs, 'up next|videos|continue to article', 'flow.js');
includes(flowJs, 'ORPHAN_WIDGET_TEXT_RE', 'flow.js');
includes(flowJs, 'PRINT_CLEANUP_FALLBACK_MS', 'flow.js');
includes(flowJs, "rememberClass(document.body, 'a4lp-reconstructed')", 'flow.js');
includes(flowJs, "insertHost.appendChild(reconstructedMain)", 'flow.js');
assert(
  !flowJs.includes('setTimeout(cleanup, 0)'),
  'flow.js must not cleanup immediately after window.print(); Chrome print preview still needs image resources'
);
includes(printCss, 'body.a4lp-print-root.a4lp-reconstructed > :not(.a4lp-source)', 'print.css');
includes(printCss, '.a4lp-reconstructed-main', 'print.css');

console.log('reconstructed print contract ok');
