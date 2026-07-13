import { ModelComplete } from "@/core/core.interface";
import { ReportConfig } from "@/shared/lib/reports/reports.interface";
import { STATUS_WORK_ORDER } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";

export const POST_VENTA_REPORTS: ReportConfig[] = [
  {
    id: "work-orders",
    title: "Reporte de Órdenes de Trabajo",
    type: "Taller",
    description:
      "Exporta el reporte de órdenes de trabajo del taller, filtrando por estado y rango de fechas.",
    icon: "Wrench",
    endpoint: "/ap/postVenta/reports/work-orders/export",
    fileName: "reporte_orden_trabajo",
    fields: [
      {
        name: "status_id",
        label: "Estado",
        type: "multiselect",
        required: false,
        placeholder: "Seleccionar estados",
        multiSelectOptions: Object.entries(STATUS_WORK_ORDER).map(
          ([key, value]) => ({
            id: value,
            name: key.replace(/_/g, " "),
          }),
        ),
        getDisplayValue: (item) => item.name,
      },
      {
        name: "date_range",
        label: "Rango de Fechas",
        type: "daterange",
        required: false,
        nameFrom: "date_from",
        nameTo: "date_to",
        rangeParamName: "opening_date",
      },
    ],
    defaultParams: {},
  },
  {
    id: "inventory-outputs",
    title: "Reporte de Salidas de Inventario",
    type: "Almacén",
    description:
      "Exporta el reporte de salidas de inventario filtrando por rango de fechas.",
    icon: "PackageSearch",
    endpoint: "/ap/postVenta/reports/inventory-outputs/export",
    fileName: "reporte_salida_inventario",
    fields: [
      {
        name: "date_range",
        label: "Rango de Fechas",
        type: "daterange",
        required: false,
        nameFrom: "date_from",
        nameTo: "date_to",
        rangeParamName: "invoice_date",
      },
    ],
    defaultParams: {},
  },
];

export const POST_VENTA_REPORTS_CONSTANTS: ModelComplete = {
  ROUTE: "/ap/post-venta/reportes",
  MODEL: {
    name: "Reportes de Post Venta",
    gender: false,
    message: "Reportes de Post Venta",
    plural: "Reportes de Post Venta",
  },
  ENDPOINT: "/ap/postVenta/reports",
  ICON: "BarChart",
  QUERY_KEY: "post-venta-reports",
  ROUTE_ADD: "/ap/post-venta/reportes/nuevo",
  ROUTE_UPDATE: "/ap/post-venta/reportes/editar",
  ABSOLUTE_ROUTE: "/ap/post-venta/reportes",
};
