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
  MORNING_START: 480, // 8:00
  MORNING_END: 780,   // 13:00
  LUNCH_START: 780,   // 13:00 (inicio refrigerio)
  LUNCH_END: 864,     // 14:24 (fin refrigerio = 1h 24min)
  AFTERNOON_START: 864, // 14:24
  AFTERNOON_END: 1080,  // 18:00
} as const;

// Convierte minutos totales a posición % en el timeline (0-100)
export function minutesToTimelinePosition(totalMinutes: number): number {
  const { MORNING_START, MORNING_END, AFTERNOON_START, AFTERNOON_END } = WORK_SCHEDULE;
  const MORNING_SEGMENT = 50;   // % del timeline que ocupa la mañana
  const LUNCH_SEGMENT = 10;     // % del timeline que ocupa el almuerzo
  const AFTERNOON_SEGMENT = 40; // % del timeline que ocupa la tarde

  if (totalMinutes >= MORNING_START && totalMinutes <= MORNING_END) {
    const progress = (totalMinutes - MORNING_START) / (MORNING_END - MORNING_START);
    return progress * MORNING_SEGMENT;
  }
  if (totalMinutes >= AFTERNOON_START && totalMinutes <= AFTERNOON_END) {
    const progress = (totalMinutes - AFTERNOON_START) / (AFTERNOON_END - AFTERNOON_START);
    return MORNING_SEGMENT + LUNCH_SEGMENT + progress * AFTERNOON_SEGMENT;
  }
  return 0;
}
