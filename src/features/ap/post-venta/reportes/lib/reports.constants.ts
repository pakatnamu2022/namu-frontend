import { ModelComplete } from "@/core/core.interface";
import { ReportConfig } from "@/shared/lib/reports/reports.interface";
import { SUNAT_CURRENCY_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

export const POST_VENTA_REPORTS: ReportConfig[] = [
  {
    id: "work-orders",
    title: "Reporte de Órdenes de Trabajo",
    type: "Taller",
    section: "DERCO",
    description:
      "Exporta el reporte de órdenes de trabajo del taller, filtrando por estado y rango de fechas.",
    icon: "Wrench",
    endpoint: "/ap/postVenta/reports/work-orders/export",
    fileName: "reporte_orden_trabajo",
    availableFormats: ["excel"],
    fields: [
      {
        name: "date_range",
        label: "Rango de Fechas",
        type: "daterange",
        required: false,
        nameFrom: "date_from",
        nameTo: "date_to",
        rangeParamName: "opening_date",
      },
      {
        name: "amounts_in_soles",
        label: "Moneda",
        type: "toggle",
        required: false,
        options: [
          { label: "Soles", value: "1" },
          { label: "Dólares", value: "0" },
        ],
        defaultValue: "1",
      },
    ],
    defaultParams: {},
  },
  {
    id: "inventory-outputs",
    title: "Reporte de Salidas de Inventario",
    type: "Almacén",
    section: "DERCO",
    description:
      "Exporta el reporte de salidas de inventario filtrando por rango de fechas.",
    icon: "PackageSearch",
    endpoint: "/ap/postVenta/reports/inventory-outputs/export",
    fileName: "reporte_salida_inventario",
    availableFormats: ["excel"],
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
  {
    id: "invoicing",
    title: "Reporte de Facturación Taller",
    type: "Facturación",
    section: "TALLER",
    description:
      "Exporta el reporte de facturación taller filtrando por rango de fechas.",
    icon: "FileText",
    endpoint: "/ap/postVenta/reports/invoicing/export",
    fileName: "reporte_facturacion_taller",
    availableFormats: ["excel"],
    fields: [
      {
        name: "date_range",
        label: "Rango de Fechas",
        type: "daterange",
        required: false,
        nameFrom: "date_from",
        nameTo: "date_to",
        rangeParamName: "fecha_emision",
      },
    ],
    defaultParams: {},
  },
  {
    id: "meson-invoicing",
    title: "Reporte de Facturación Repuestos",
    type: "Facturación",
    section: "REPUESTOS",
    description:
      "Exporta el reporte de facturación de repuestos filtrando por rango de fechas.",
    icon: "FileText",
    endpoint: "/ap/postVenta/reports/meson-invoicing/export",
    fileName: "reporte_facturacion_repuestos",
    availableFormats: ["excel"],
    fields: [
      {
        name: "date_range",
        label: "Rango de Fechas",
        type: "daterange",
        required: false,
        nameFrom: "date_from",
        nameTo: "date_to",
        rangeParamName: "fecha_emision",
      },
    ],
    defaultParams: {},
  },
  {
    id: "electronic-documents",
    title: "Reporte de Ordenes de Compra / Caja",
    type: "Facturación",
    section: "CAJA",
    description:
      "Exporta el reporte de ordenes de compra en el área de caja filtrando por rango de fechas y moneda.",
    icon: "FileText",
    endpoint: "/ap/postVenta/reports/electronic-documents/export",
    fileName: "reporte_orden_compra_caja",
    availableFormats: ["excel"],
    fields: [
      {
        name: "date_range",
        label: "Rango de Fechas",
        type: "daterange",
        required: false,
        nameFrom: "date_from",
        nameTo: "date_to",
        rangeParamName: "fecha_emision",
      },
      {
        name: "sunat_concept_currency_id",
        label: "Moneda",
        type: "toggle",
        required: false,
        options: [
          { label: "Soles", value: String(SUNAT_CURRENCY_ID.SOLES) },
          { label: "Dólares", value: String(SUNAT_CURRENCY_ID.DOLARES) },
        ],
        defaultValue: String(SUNAT_CURRENCY_ID.SOLES),
      },
    ],
    defaultParams: {},
  },
];

export const POST_VENTA_REPORTS_CONSTANTS: ModelComplete = {
  ROUTE: "/ap/post-venta/indicadores-y-reportes/reportes",
  MODEL: {
    name: "Reportes de Post Venta",
    gender: false,
    message: "Reportes de Post Venta",
    plural: "Reportes de Post Venta",
  },
  ENDPOINT: "/ap/postVenta/reports",
  ICON: "BarChart",
  QUERY_KEY: "post-venta-reports",
  ROUTE_ADD: "/ap/post-venta/indicadores-y-reportes/reportes/nuevo",
  ROUTE_UPDATE: "/ap/post-venta/indicadores-y-reportes/reportes/editar",
  ABSOLUTE_ROUTE: "/ap/post-venta/indicadores-y-reportes/reportes",
};
