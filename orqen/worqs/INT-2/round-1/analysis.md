# INT-2 — analysis (round 1)

- **Analyst:** Enzo Sives
- **Route:** development
- **Lane:** direct
- **Lane rationale:** Internal development: no client request, direct lane.
- **Issue:** —
- **Estimate:** 6 h

## Summary

Agregar documentación general del proyecto en docs/. Cubre qué es el repo, cómo funcionan scenario.mjs y generate.mjs, cómo correr los tests de scripts/ y cómo se relaciona con orqen, orqen-gui y el Kanban de referencia, para que quien llega nuevo entienda el repo sin leer el código.

## Acceptance criteria

- Dado el repo, cuando se abre docs/, entonces existe un docs/README.md que sirve de índice y enlaza a todos los documentos, incluidos interno.md y prueba-orqen.md.
- Dado docs/, cuando una persona nueva lo lee, entonces encuentra un documento de arquitectura que explica el rol de scenario.mjs, generate.mjs y orqen/.
- Dado docs/, cuando se busca cómo probar, entonces hay una guía que indica cómo ejecutar los tests de scripts/ (node --test) y qué cubre cada uno.
- Dado cualquier enlace relativo en docs/, cuando se sigue, entonces apunta a un archivo existente.

## Plan (direct lane)

1. Revisar el código y los docs existentes (1h)
2. Escribir docs/README.md como índice (1h)
3. Escribir docs/arquitectura.md (2h)
4. Escribir docs/pruebas.md (1h)
5. Revisar enlaces y consistencia con el README raíz (1h)

