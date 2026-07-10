const ROUTE = "planificacion-orden-trabajo";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const WORK_ORDER_PLANNING = {
  MODEL: {
    name: "Planificación de Orden de Trabajo",
    plural: "Planificaciones de Órdenes de Trabajo",
    gender: true,
  },
  ICON: "Calendar",
  ENDPOINT: "/ap/postVenta/workOrderPlanning",
  QUERY_KEY: "workOrderPlanning",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const PLANNING_TYPE_LABELS: Record<string, string> = {
  internal: "Dentro Horario",
  external: "Adicional",
};

// Horario laboral en minutos desde medianoche
// Cambiar aquí si el refrigerio o el horario cambia
export const WORK_SCHEDULE = {
  MORNING_START: 0,    // 00:00
  MORNING_END: 780,    // 13:00
  LUNCH_START: 780,    // 13:00 (inicio refrigerio)
  LUNCH_END: 864,      // 14:24 (fin refrigerio = 1h 24min)
  AFTERNOON_START: 864, // 14:24
  AFTERNOON_END: 1440,  // 24:00
} as const;

// Convierte minutos totales a posición % en el timeline (0-100)
// Los segmentos se calculan proporcionalmente a la duración real de cada tramo,
// de modo que 1 minuto ocupe el mismo ancho visual en cualquier punto del día.
export function minutesToTimelinePosition(totalMinutes: number): number {
  const { MORNING_START, MORNING_END, LUNCH_START, LUNCH_END, AFTERNOON_START, AFTERNOON_END } =
    WORK_SCHEDULE;
  const morningDuration = MORNING_END - MORNING_START;
  const lunchDuration = LUNCH_END - LUNCH_START;
  const afternoonDuration = AFTERNOON_END - AFTERNOON_START;
  const totalDuration = morningDuration + lunchDuration + afternoonDuration;

  const MORNING_SEGMENT = (morningDuration / totalDuration) * 100;
  const LUNCH_SEGMENT = (lunchDuration / totalDuration) * 100;
  const AFTERNOON_SEGMENT = (afternoonDuration / totalDuration) * 100;

  if (totalMinutes >= MORNING_START && totalMinutes <= MORNING_END) {
    const progress = (totalMinutes - MORNING_START) / morningDuration;
    return progress * MORNING_SEGMENT;
  }
  if (totalMinutes >= AFTERNOON_START && totalMinutes <= AFTERNOON_END) {
    const progress = (totalMinutes - AFTERNOON_START) / afternoonDuration;
    return MORNING_SEGMENT + LUNCH_SEGMENT + progress * AFTERNOON_SEGMENT;
  }
  return 0;
}

// % de ancho del timeline que ocupa cada segmento (mañana / almuerzo / tarde)
export function getTimelineSegments() {
  const { MORNING_START, MORNING_END, LUNCH_START, LUNCH_END, AFTERNOON_START, AFTERNOON_END } =
    WORK_SCHEDULE;
  const morningDuration = MORNING_END - MORNING_START;
  const lunchDuration = LUNCH_END - LUNCH_START;
  const afternoonDuration = AFTERNOON_END - AFTERNOON_START;
  const totalDuration = morningDuration + lunchDuration + afternoonDuration;

  const morning = (morningDuration / totalDuration) * 100;
  const lunch = (lunchDuration / totalDuration) * 100;
  const afternoon = (afternoonDuration / totalDuration) * 100;

  return { morning, lunch, afternoon, lunchEnd: morning + lunch };
}
