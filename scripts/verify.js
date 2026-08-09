#!/usr/bin/env node
/**
 * Zero-dependency verification harness for a static site (HTML/CSS/JS).
 * Catches cheap, silent errors before they ship:
 *   - unbalanced braces/parens in JS & CSS
 *   - unclosed HTML tags
 *   - broken internal anchors (#id without a matching element)
 *   - missing aria-labels on buttons
 *   - hardcoded hex colors that bypass theme variables
 *
 * Run: npm test   (or: node scripts/verify.js)
 * Exit code 1 = problems found, so it works in CI too.
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const files = {
  html: path.join(root, 'index.html'),
  js: path.join(root, 'script.js'),
  css: path.join(root, 'styles.css'),
};

const errors = [];

function read(name) {
  try {
    return fs.readFileSync(files[name], 'utf8');
  } catch (e) {
    errors.push(`Missing file: ${name} (${files[name]})`);
    return '';
  }
}

function checkBalance(src, label, open, close) {
  let depth = 0;
  let inStr = null;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === '\\') { i++; continue; }
      if (c === inStr) inStr = null;
      continue;
    }
    if (c === '"' || c === "'" || c === '`') { inStr = c; continue; }
    if (c === open) depth++;
    else if (c === close) {
      depth--;
      if (depth < 0) { errors.push(`${label}: unmatched '${close}'`); return; }
    }
  }
  if (depth !== 0) errors.push(`${label}: unbalanced '${open}'/'${close}' (depth ${depth})`);
}

const html = read('html');
const js = read('js');
const css = read('css');

checkBalance(js, 'script.js', '(', ')');
checkBalance(js, 'script.js', '{', '}');
checkBalance(css, 'styles.css', '{', '}');

if (html) {
  const voidEls = new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const stack = [];
  const re = /<(\/?)([a-zA-Z0-9]+)(\s[^>]*?)?(\/?)?>/g;
  let m;
  while ((m = re.exec(html))) {
    const closing = m[1] === '/';
    const tag = m[2].toLowerCase();
    const selfClose = m[4] === '/';
    if (voidEls.has(tag) || selfClose) continue;
    if (!closing) stack.push(tag);
    else {
      if (stack.length === 0) { errors.push(`index.html: extra closing </${tag}>`); }
      else if (stack[stack.length - 1] !== tag) {
        errors.push(`index.html: mismatched </${tag}> (expected </${stack[stack.length - 1]}>`);
        stack.pop();
      } else stack.pop();
    }
  }
  if (stack.length) errors.push(`index.html: unclosed tags: ${stack.join(', ')}`);

  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(x => x[1]));
  const anchors = [...html.matchAll(/href="#([^"]+)"/g)].map(x => x[1]).filter(a => a);
  for (const a of anchors) {
    if (a !== 'top' && !ids.has(a)) errors.push(`index.html: anchor "#${a}" has no matching id=`);
  }

  const btnRe = /<button\b([^>]*)>/g;
  let b;
  while ((b = btnRe.exec(html))) {
    const attrs = b[1];
    const hasAria = /aria-label=/.test(attrs);
    const inner = b[0].replace(/<button[^>]*>/, '').replace(/<\/button>/, '').trim();
    if (!hasAria && inner.length === 0) errors.push(`index.html: <button> missing aria-label or text content`);
  }
}

if (css) {
  const matches = css.match(/#[0-9a-fA-F]{3,8}\b/g) || [];
  if (matches.length > 30) {
    errors.push(`styles.css: ${matches.length} hardcoded hex colors — prefer CSS variables to keep light/dark in sync`);
  }
}

if (errors.length) {
  console.log('\n❌ Verification found issues:\n');
  for (const e of errors) console.log('  - ' + e);
  console.log(`\n${errors.length} problem(s). Fix before shipping.\n`);
  process.exit(1);
} else {
  console.log('✅ All checks passed — HTML tags balanced, anchors resolve, no hard errors.');
  process.exit(0);
}
