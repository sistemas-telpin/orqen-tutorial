'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const docsDir = path.join(__dirname, '..', 'docs');
const linkRe = /\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

// Devuelve los destinos de enlace de un markdown, ignorando los bloques de código con ```.
function linkTargets(text) {
  const targets = [];
  let inFence = false;
  for (const line of text.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) { inFence = !inFence; continue; }
    if (inFence) continue;
    for (const m of line.matchAll(linkRe)) targets.push(m[1]);
  }
  return targets;
}

// Enlaces relativos (sin URL externa ni ancla) resueltos a ruta absoluta.
function relativeTargets(file) {
  const dir = path.dirname(file);
  return linkTargets(fs.readFileSync(file, 'utf8'))
    .filter((t) => !/^(https?:|mailto:|#)/.test(t))
    .map((t) => decodeURIComponent(t.replace(/[#?].*$/, '')))
    .filter((t) => t !== '')
    .map((t) => path.resolve(dir, t));
}

const mdFiles = fs.readdirSync(docsDir).filter((f) => f.endsWith('.md'));

test('los enlaces relativos de docs/ apuntan a archivos existentes', () => {
  for (const name of mdFiles) {
    const file = path.join(docsDir, name);
    const dir = path.dirname(file);
    for (const t of linkTargets(fs.readFileSync(file, 'utf8'))) {
      if (/^(https?:|mailto:|#)/.test(t)) continue;
      const clean = decodeURIComponent(t.replace(/[#?].*$/, ''));
      if (clean === '') continue;
      const target = path.resolve(dir, clean);
      assert.ok(fs.existsSync(target), `${name}: el enlace "${t}" no apunta a un archivo existente`);
    }
  }
});

test('docs/README.md enlaza a todos los documentos de docs/', () => {
  const index = path.join(docsDir, 'README.md');
  const linked = new Set(relativeTargets(index));
  for (const name of mdFiles) {
    if (name === 'README.md') continue;
    assert.ok(linked.has(path.join(docsDir, name)), `docs/README.md no enlaza a ${name}`);
  }
});
