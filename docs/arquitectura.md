# Arquitectura del repositorio

## 1. Visión general

Este repositorio es la referencia del **tutorial interactivo** de [ORQEN Desktop](https://github.com/sistemas-telpin/orqen-gui) (`orqen-gui`). El tutorial usa un tablero local con seis pedidos ficticios; cada sesión parte del mismo tablero y los cambios se descartan al salir.

Se relaciona con tres repositorios:

- **Este repo (tutorial):** define el escenario, las tarjetas y los pasos de la práctica, y genera el paquete que consume la GUI.
- **[ORQEN CLI](https://github.com/sistemas-telpin/orqen)** (`orqen`): la herramienta de flujo de trabajo. El generador lee de su código compilado las reglas de estados (`cli/dist/workflow/states.js`) y registra su commit.
- **[orqen-gui](https://github.com/sistemas-telpin/orqen-gui)**: la aplicación de escritorio que muestra el tutorial. Recibe el paquete generado en `assets/tutorial.json`.

Además, las mismas tarjetas de ejemplo existen en el **Kanban de referencia de GitHub**: <https://github.com/orgs/sistemas-telpin/projects/5/views/1>. La URL está en [`project.json`](../project.json).

Los tres repositorios se clonan como carpetas hermanas, por ejemplo `orqen-tutorial-prueba/`, `orqen/` y `orqen-gui/`. Por eso las rutas por defecto del generador son relativas (`../orqen`, `../orqen-gui/assets/tutorial.json`).

## 2. `scenario.mjs`: el escenario del tutorial

Es el archivo que se edita para cambiar la práctica. Exporta cuatro elementos.

### `columns`

Cinco columnas del tablero. Cada una tiene un título en español y en inglés (`es` / `en`) y agrupa una o más etapas de ORQEN:

| Columna (es / en) | Etapas que agrupa |
| --- | --- |
| Pendientes / Pending | `NEW` |
| Análisis / Analysis | `ANALYSIS` |
| Desarrollo y testing / Development and testing | `DEVELOPMENT`, `TESTING` |
| Revisión / Review | `CODE_REVIEW` |
| Entrega y cierre / Delivery and closure | `DELIVERY`, `ACCEPTANCE`, `CLOSED` |

### `cards`

Seis pedidos ficticios, `TUT-1` a `TUT-6`. Cada tarjeta tiene `key`, `title` (es/en), `stage` y `description`:

| Clave | Título (es) | Etapa |
| --- | --- | --- |
| `TUT-1` | Exportar el listado de pedidos a CSV | `NEW` |
| `TUT-2` | Agregar un filtro por fecha | `NEW` |
| `TUT-3` | Aclarar el mensaje cuando no hay resultados | `ANALYSIS` |
| `TUT-4` | Recordar el orden del listado | `DEVELOPMENT` |
| `TUT-5` | Validar los campos del formulario | `CODE_REVIEW` |
| `TUT-6` | Mostrar la fecha de última actualización | `ACCEPTANCE` |

### `guidedCard`

Clave de la tarjeta que guía la práctica: el primer pedido, `TUT-1` (exportar a CSV). Se obtiene de `cards[0].key`.

### `lessons({ State, nextStateAfterStage, GATES })`

Devuelve los **12 pasos** guiados. Cada paso tiene `title` y `body` (es/en). El primero tiene `select: true`, y los pasos con `event` ({`from`, `to`, `label`}) mueven la tarjeta por el flujo hasta `CLOSED`. Los pasos son, en orden:

1. Elegí un pedido
2. Tomá el pedido
3. Confirmá el análisis
4. Implementá el cambio
5. Observá un test fallido
6. Volvé a desarrollo
7. Probá la corrección
8. Abrí el PR de ejemplo
9. Aprobá la revisión
10. Entregá el cambio
11. Confirmá el cierre
12. Pedido cerrado

El último paso no tiene `event`: es el cierre del recorrido.

## 3. `generate.mjs`: el generador del paquete

Construye el paquete `tutorial.json` que usa `orqen-gui`, a partir de `scenario.mjs`, de la CLI de orqen compilada y de `project.json`. Sus pasos son:

1. Importa `cli/dist/workflow/states.js` del repo de la CLI, así que la CLI debe estar compilada.
2. Registra el commit de la CLI con `git rev-parse HEAD` como `source`.
3. Lee `project.json` para obtener `projectUrl`.
4. Valida el recorrido:
   - cada etapa de cada tarjeta pertenece a exactamente una columna;
   - existe la tarjeta guiada;
   - el primer paso tiene `select: true`;
   - cada transición (`event`) parte de la etapa actual y llega a una etapa válida;
   - el tutorial termina en `CLOSED` y el último paso no tiene `event`.
5. Escribe un JSON con la forma `{ source, projectUrl, columns, cards, guidedCard, steps }`.

### Uso

Argumentos: `[cliRepo=../orqen] [output=../orqen-gui/assets/tutorial.json] [--check]`

```sh
node generate.mjs
node generate.mjs ../orqen ../orqen-gui/assets/tutorial.json --check
```

- `node generate.mjs` escribe el paquete en la ruta por defecto.
- Con `--check` no escribe nada: si el archivo existente no coincide con el paquete que se generaría, termina con el error `The GUI tutorial bundle is out of date`. Sirve para verificar que `orqen-gui` está sincronizado con el escenario y con la CLI.

Antes de generar hay que compilar la CLI, desde `orqen/cli`:

```sh
npm ci
npm run build
```

## 4. `project.json`

Contiene una sola clave, `url`, con la URL del Kanban de referencia de GitHub:

```json
{
  "url": "https://github.com/orgs/sistemas-telpin/projects/5/views/1"
}
```

El generador la copia como `projectUrl` en el paquete. Si cambia el tablero de referencia, se actualiza aquí y se regenera el paquete.

## 5. `orqen/`: configuración del flujo

Esta carpeta contiene la configuración de ORQEN para el proyecto de prueba. **La gestiona orqen: no se edita a mano.** Incluye:

- `config.yaml`: proyecto, conectores (dónde viven los tickets), flujo de trabajo y aprobadores.
- `environment.yaml`: cómo arranca cada parte del proyecto (procesos, directorio, puerto).
- `manifest.json`: versión del kit y huellas (hash) de los archivos de `orqen/`. `plugin/`: el plugin de ORQEN (comandos y skills).
- `stages/*.md`: instrucciones de cada etapa: `analysis`, `delivery`, `development`, `execution`, `specification`, `support`, `testing` y `verification`.
- `worqs/`: el registro de cada pedido (un **worq**: el pedido, su issue, la rama, la especificación, el PR y el historial de cada etapa), en carpetas con la clave del pedido, por ejemplo `INT-1/`. Ver [`orqen/worqs/README.md`](../orqen/worqs/README.md).
- `state/`: el estado del flujo de trabajo. orqen crea `orqen/state/` al usarse y está listado en `.gitignore`, así que no se versiona. Según la configuración, orqen puede guardarlo en `cli/.state/` en lugar de aquí.

Los cambios de un pedido se hacen con los comandos de ORQEN (`/orqen:*` u `orqen <comando>`), no editando estos archivos. Ver el flujo en [`AGENTS.md`](../AGENTS.md).

---

[Volver al índice](README.md)
