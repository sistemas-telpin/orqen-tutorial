const text = (es, en) => ({ es, en });

export const columns = [
  text("Pendientes", "Pending"),
  text("Análisis", "Analysis"),
  text("Desarrollo y testing", "Development and testing"),
  text("Revisión", "Review"),
  text("Entrega y cierre", "Delivery and closure"),
].map((title, index) => ({
  title,
  stages: [
    ["NEW"], ["ANALYSIS"], ["DEVELOPMENT", "TESTING"], ["CODE_REVIEW"],
    ["DELIVERY", "ACCEPTANCE", "CLOSED"],
  ][index],
}));

export const cards = [
  ["NEW", "Exportar el listado de pedidos a CSV", "Export the request list to CSV", "El equipo necesita descargar el listado de pedidos desde la pantalla de búsqueda."],
  ["NEW", "Agregar un filtro por fecha", "Add a date filter", "Permitir elegir un rango de fechas para acotar el listado."],
  ["ANALYSIS", "Aclarar el mensaje cuando no hay resultados", "Clarify the empty search message", "Explicar cómo ajustar la búsqueda cuando el listado está vacío."],
  ["DEVELOPMENT", "Recordar el orden del listado", "Remember the list sort order", "Conservar el orden elegido al volver a abrir la pantalla."],
  ["CODE_REVIEW", "Validar los campos del formulario", "Validate form fields", "Marcar los campos obligatorios antes de enviar el formulario."],
  ["ACCEPTANCE", "Mostrar la fecha de última actualización", "Show the last updated date", "Mostrar cuándo se actualizó el pedido en su ficha."],
].map(([stage, es, en, description], index) => ({
  key: `TUT-${index + 1}`, title: text(es, en), stage, description,
}));

export const guidedCard = cards[0].key;

export function lessons({ State, nextStateAfterStage, GATES }) {
  let stage = State.NEW;
  const context = { lane: "direct", testingAttempts: 0, questionRounds: 0 };
  const step = (titleEs, titleEn, bodyEs, bodyEn) => ({
    title: text(titleEs, titleEn), body: text(bodyEs, bodyEn),
  });
  const action = (labelEs, labelEn, next = stage) => {
    const event = { from: stage, to: next, label: text(labelEs, labelEn) };
    stage = next;
    return event;
  };
  const complete = (output) => nextStateAfterStage(stage, output, context);
  const test = (approved) => {
    context.testingAttempts++;
    return complete({ approved });
  };
  return [
    { ...step("Elegí un pedido", "Pick a request",
      "Abrí la tarjeta del CSV en Pendientes. Cada columna agrupa etapas del flujo de ORQEN.",
      "Open the CSV card in Pending. Each column groups stages of the ORQEN workflow."), select: true },
    { ...step("Tomá el pedido", "Take the request",
      "El analista toma el pedido con /orqen:analyze. Mirá cómo pasa a Análisis.",
      "The analyst takes the request with /orqen:analyze. Watch it move to Analysis."),
      event: action("Tomar para análisis", "Start analysis", State.ANALYSIS) },
    { ...step("Confirmá el análisis", "Confirm the analysis",
      "Acordá que el CSV incluya los pedidos filtrados. El carril directo usa un plan y criterios de aceptación.",
      "Agree that the CSV must include the filtered requests. The direct lane uses a plan and acceptance criteria."),
      event: action("Confirmar análisis", "Confirm analysis", complete({ ready: true, route: "development" })) },
    { ...step("Implementá el cambio", "Implement the change",
      "El agente aplica el plan con /orqen:implement. Al terminar, el pedido queda listo para testing.",
      "The agent follows the plan with /orqen:implement. When it finishes, the request is ready for testing."),
      event: action("Completar implementación", "Complete implementation", complete({ completed: true })) },
    { ...step("Observá un test fallido", "Watch a test fail",
      "El primer CSV incluye pedidos fuera del filtro. Corré la prueba y mirá la etapa exacta y el historial.",
      "The first CSV includes requests outside the filter. Run the test and watch the stage and history."),
      event: action("Correr prueba", "Run test", test(false)) },
    { ...step("Volvé a desarrollo", "Return to development",
      "El pedido volvió a DEVELOPMENT. Aplicá el filtro al exportar y prepará otra prueba.",
      "The request returned to DEVELOPMENT. Apply the filter to the export and prepare another test."),
      event: action("Aplicar corrección", "Apply fix", complete({ completed: true })) },
    { ...step("Probá la corrección", "Test the fix",
      "El CSV ahora respeta el filtro. Si la prueba pasa, el pedido entra en Revisión.",
      "The CSV now respects the filter. If the test passes, the request enters Review."),
      event: action("Volver a correr la prueba", "Run the test again", test(true)) },
    { ...step("Abrí el PR de ejemplo", "Open the sample PR",
      "Con /orqen:pr se prepara el PR para revisión. La apertura queda en el historial y la etapa sigue en CODE_REVIEW.",
      "/orqen:pr prepares the pull request for review. Opening it appears in the history while the stage stays at CODE_REVIEW."),
      event: action("Abrir PR de ejemplo", "Open sample PR") },
    { ...step("Aprobá la revisión", "Approve the review",
      "El revisor confirma los cambios y las pruebas. La aprobación habilita la entrega.",
      "The reviewer confirms the changes and tests. Approval clears the request for delivery."),
      event: action("Aprobar revisión", "Approve review", GATES[stage].approve) },
    { ...step("Entregá el cambio", "Deliver the change",
      "Se comunica qué se entregó y cómo probarlo. El pedido queda esperando la confirmación del cliente.",
      "Share what was delivered and how to try it. The request waits for customer acceptance."),
      event: action("Completar entrega", "Complete delivery", complete({})) },
    { ...step("Confirmá el cierre", "Confirm closure",
      "El cliente verifica que la descarga funciona. Su conformidad cierra el pedido.",
      "The customer verifies that the download works. Accepting it closes the request."),
      event: action("Confirmar conformidad", "Accept delivery", GATES[stage].approve) },
    step("Pedido cerrado", "Request closed",
      "Revisá el historial para ver el recorrido completo. Podés reiniciar la práctica o salir.",
      "Review the history to see the full journey. You can restart the practice or exit."),
  ];
}
