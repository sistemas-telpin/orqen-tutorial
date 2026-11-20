'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const file = path.join(__dirname, '..', 'docs', 'prueba-orqen.md');
test('existe y su primera línea es el título', () => {
  assert.equal(fs.readFileSync(file, 'utf8').split(/\r?\n/)[0], '# Prueba de orqen');
});
test('menciona a orqen', () => { assert.match(fs.readFileSync(file, 'utf8'), /orqen/i); });
