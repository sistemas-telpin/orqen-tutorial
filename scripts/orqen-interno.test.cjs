'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
test('docs/interno.md existe y menciona el desarrollo interno', () => {
  const t = fs.readFileSync(path.join(__dirname, '..', 'docs', 'interno.md'), 'utf8');
  assert.match(t, /desarrollo interno/i);
});
