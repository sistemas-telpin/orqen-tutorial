'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const texto = () => fs.readFileSync(path.join(__dirname, '..', 'docs', 'flujo-completo.md'), 'utf8');
test('su primera línea es el título', () => {
  assert.equal(texto().split(/\r?\n/)[0], '# Flujo completo de orqen');
});
test('lista los 9 pasos numerados', () => {
  const pasos = texto().split(/\r?\n/).filter((l) => /^\d+\. /.test(l)).map((l) => Number(l.split('.')[0]));
  assert.deepEqual(pasos, [1, 2, 3, 4, 5, 6, 7, 8, 9]);
});
