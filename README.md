# ORQEN Tutorial

Repositorio de referencia para el tutorial interactivo de [ORQEN Desktop](https://github.com/sistemas-telpin/orqen-gui). La práctica usa un tablero local con seis pedidos ficticios. Cada sesión empieza con el mismo tablero y sus cambios se descartan al salir.

Las tarjetas de ejemplo también están en el [Kanban de referencia de GitHub](https://github.com/orgs/sistemas-telpin/projects/5/views/1).

En la app, abrí **Tutorial interactivo** en la pantalla inicial o **Iniciar práctica** desde **Configuración → Tutorial**. Seleccioná el pedido de CSV y seguí las indicaciones. El tablero, la etapa y el historial reaccionan a tus acciones durante la práctica.

## Actualizar los ejemplos

Con los tres repositorios clonados en carpetas hermanas, compilá la CLI de [ORQEN](https://github.com/sistemas-telpin/orqen) desde `orqen/cli` con `npm ci` y `npm run build`. Editá `scenario.mjs` y ejecutá, desde la raíz de este repo:

```sh
node generate.mjs
node generate.mjs ../orqen ../orqen-gui/assets/tutorial.json --check
```

El generador usa las reglas de la CLI compilada y registra su commit. Revisá el cambio en `orqen-gui/assets/tutorial.json` junto con el escenario y mantené sincronizados los títulos y las columnas de las tarjetas de referencia en GitHub.
