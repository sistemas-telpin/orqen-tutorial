# Pruebas

Este documento explica cómo ejecutar las pruebas del repositorio y qué cubre cada una.

## Cómo ejecutar las pruebas

Las pruebas usan el runner integrado de Node.js (`node:test`) y están escritas en CommonJS, en archivos `.cjs` dentro de `scripts/`.

Desde la raíz del repositorio, ejecuta:

```sh
node --test
```

Node encuentra automáticamente los archivos `scripts/*.test.cjs` y los ejecuta.

Para ejecutar un solo archivo de prueba, indícalo como argumento:

```sh
node --test scripts/docs-links.test.cjs
```

## Qué cubre cada prueba

| Archivo | Qué comprueba |
| --- | --- |
| `scripts/orqen-interno.test.cjs` | Que [`docs/interno.md`](interno.md) existe y que menciona "desarrollo interno". |
| `scripts/orqen-prueba.test.cjs` | Que [`docs/prueba-orqen.md`](prueba-orqen.md) existe, que su primera línea es exactamente el título `# Prueba de orqen` y que menciona orqen. |
| `scripts/docs-links.test.cjs` | Que cada enlace relativo de los archivos `.md` de `docs/` apunta a un archivo existente, y que [`README.md`](README.md) enlaza a todos los demás `.md` de `docs/`. |

## Añadir una prueba nueva

1. Crea un archivo `scripts/<nombre>.test.cjs`.
2. Empieza con `'use strict';` y carga el runner y el módulo de aserciones igual que las pruebas existentes:

   ```js
   'use strict';
   const test = require('node:test');
   const assert = require('node:assert/strict');
   ```

3. Si añades un `.md` nuevo en `docs/`, enlázalo desde [`docs/README.md`](README.md). Si no lo haces, la prueba `docs-links` fallará.

[Volver al índice](README.md)
