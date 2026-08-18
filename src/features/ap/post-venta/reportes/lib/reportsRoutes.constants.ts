// Centraliza las rutas de reportes (POST .../export) del área de Post Venta.
// Refleja 1 a 1 el grupo de rutas "Reports" definido en el backend
// (routes/api.php, prefijo /ap/postVenta), para que cualquier endpoint de
// exportación se importe desde aquí en vez de hardcodearse en componentes.
export const POST_VENTA_REPORTS_ROUTES = {
  WORK_ORDERS_EXPORT: "/ap/postVenta/reports/work-orders/export",
  WORK_ORDER_OPENINGS_EXPORT:
    "/ap/postVenta/reports/work-orders/openings/export",
  WORK_ORDER_PARTS_EXPORT: "/ap/postVenta/reports/work-orders/parts/export",
  WORKED_HOURS_BY_SEDE_EXPORT:
    "/ap/postVenta/reports/worked-hours-by-sede/export",
  CLOSED_WORK_ORDER_BILLED_HOURS_EXPORT:
    "/ap/postVenta/reports/closed-work-order-billed-hours/export",
  INVOICING_EXPORT: "/ap/postVenta/reports/invoicing/export",
  ELECTRONIC_DOCUMENTS_EXPORT:
    "/ap/postVenta/reports/electronic-documents/export",
  ELECTRONIC_DOCUMENTS_DETAILED_EXPORT:
    "/ap/postVenta/reports/electronic-documents/detailed/export",
} as const;
