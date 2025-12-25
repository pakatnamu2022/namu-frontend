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
