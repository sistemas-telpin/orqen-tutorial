# INT-2: Desarrollo rapido — documentación del proyecto en docs/

Desarrollo interno (sin request ni issue), carril direct. Base: `prueba/flujo-base`.

## Resumen
Se agrega documentación general en `docs/` para que quien llega nuevo entienda el repo sin leer el código, más un test que evita enlaces rotos.

## Cambios
- `docs/README.md`: índice con enlaces a `arquitectura.md`, `pruebas.md`, `interno.md` y `prueba-orqen.md`, y al README raíz.
- `docs/arquitectura.md`: rol de `scenario.mjs` (5 columnas, TUT-1 a TUT-6, 12 pasos de `lessons()`), `generate.mjs` (validaciones, uso y `--check`), `project.json` y `orqen/`; relación con orqen, orqen-gui y el Kanban de referencia.
- `docs/pruebas.md`: cómo ejecutar los tests y qué cubre cada uno en `scripts/`.
- `scripts/docs-links.test.cjs`: comprueba que los enlaces relativos de `docs/*.md` apuntan a archivos existentes y que `docs/README.md` enlaza a todos los demás documentos.

No se modificó código existente, `README.md` ni `orqen/` (salvo el registro del worq en `orqen/worqs/INT-2/`).

## Decisiones y desviaciones
- Se documenta `node --test` y no `node --test scripts/`: en Node 22.17 el segundo falla con `MODULE_NOT_FOUND` (trata el directorio como archivo).
- `docs/arquitectura.md` dice que `orqen/state/` "no aparece como carpeta", pero existe en el repo. Pendiente de corregir.

## Tests y criterios de aceptación
`node --test`: 5 de 5 pasan (corrido a mano). La suite que ejecuta orqen en TESTING (`tests.unit` en `orqen/environment.yaml`) solo corre `orqen-interno.test.cjs` y pasó.

| Criterio | Cobertura |
| --- | --- |
| 1. `docs/README.md` es índice y enlaza a todos los documentos | `scripts/docs-links.test.cjs::docs/README.md enlaza a todos los documentos de docs/` |
| 2. Documento de arquitectura (`scenario.mjs`, `generate.mjs`, `orqen/`) | Sin test automatizado; revisión manual de `docs/arquitectura.md`, aceptada por la persona |
| 3. Guía de pruebas (`node --test`) | Sin test automatizado; revisión manual de `docs/pruebas.md`, aceptada por la persona |
| 4. Enlaces relativos de `docs/` existen | `scripts/docs-links.test.cjs::los enlaces relativos de docs/ apuntan a archivos existentes` |

## Cómo verificar
1. `node --test` desde la raíz: 5 tests, todos OK.
2. Abrir `docs/README.md` y seguir cada enlace.

## Riesgos y pendientes
- `tests.unit` en `orqen/environment.yaml` ejecuta un solo archivo; conviene cambiarlo a `node --test`.
- Corregir la frase sobre `orqen/state/` en `docs/arquitectura.md`.
- Los criterios 2 y 3 no tienen test de contenido.
