# INT-2: Desarrollo rapido — documentación del proyecto en docs/ (ronda 2)

Desarrollo interno (sin request ni issue), carril direct. Base: `prueba/flujo-base`. Esta ronda atiende los cambios pedidos en la revisión #1 del PR.

## Resumen
Se agrega documentación general en `docs/` (índice, arquitectura y guía de pruebas) y un test que evita enlaces rotos. La ronda 2 corrige dos observaciones menores del senior.

## Cambios de la ronda 2 (respuesta a la revisión)
1. `docs/arquitectura.md`, punto `state/`: ya no dice que "no aparece como carpeta". Ahora indica que `orqen/state/` se crea al usar orqen y está en `.gitignore`, así que no se versiona; según la configuración puede guardarse en `cli/.state/`.
2. Tono unificado en tuteo: `docs/README.md` ("volvé" pasa a "vuelve"). `docs/pruebas.md` ya estaba en tuteo y `docs/arquitectura.md` no tenía voseo propio. Los títulos de pasos citados de `scenario.mjs` no se tocaron.

## Cambios del PR (acumulados)
- `docs/README.md`: índice con enlaces a `arquitectura.md`, `pruebas.md`, `interno.md` y `prueba-orqen.md`, y al README raíz.
- `docs/arquitectura.md`: rol de `scenario.mjs`, `generate.mjs`, `project.json` y `orqen/`; relación con orqen, orqen-gui y el Kanban de referencia.
- `docs/pruebas.md`: cómo ejecutar los tests y qué cubre cada uno.
- `scripts/docs-links.test.cjs`: comprueba que los enlaces relativos de `docs/*.md` existen y que `docs/README.md` enlaza a todos los demás documentos.

## Decisiones y desviaciones
- Se documenta `node --test` y no `node --test scripts/`: en Node 22.17 el segundo falla con `MODULE_NOT_FOUND`.
- Hallazgo #3 de la revisión (cambiar `tests.unit` en `orqen/environment.yaml` a `node --test`): fuera de alcance de este PR, tarea aparte.

## Tests y criterios de aceptación
`node --test`: 5 de 5 pasan (corrido a mano). La suite que ejecuta orqen en TESTING (`tests.unit`) solo corre `orqen-interno.test.cjs` y pasó.

| Criterio | Cobertura |
| --- | --- |
| 1. `docs/README.md` es índice y enlaza a todos los documentos | `scripts/docs-links.test.cjs::docs/README.md enlaza a todos los documentos de docs/` |
| 2. Documento de arquitectura | Sin test automatizado; revisión manual, aceptada por la persona |
| 3. Guía de pruebas (`node --test`) | Sin test automatizado; revisión manual, aceptada por la persona |
| 4. Enlaces relativos de `docs/` existen | `scripts/docs-links.test.cjs::los enlaces relativos de docs/ apuntan a archivos existentes` |

## Cómo verificar
1. `node --test` desde la raíz: 5 tests, todos OK.
2. Leer la sección 5 de `docs/arquitectura.md` (punto `state/`) y `docs/README.md:10`.

## Riesgos y pendientes
- `tests.unit` en `orqen/environment.yaml` ejecuta un solo archivo (tarea aparte).
- Los criterios 2 y 3 no tienen test de contenido.
