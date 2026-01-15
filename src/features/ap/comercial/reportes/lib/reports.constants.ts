import { ModelComplete } from "@/core/core.interface";
import { ReportConfig } from "./reports.interface";

export const COMMERCIAL_REPORTS: ReportConfig[] = [
  {
    id: "vehicle-sales",
    title: "Reporte de Ventas de Vehículos",
    description: "Exporta el reporte de ventas de vehículos",
    icon: "TrendingUp",
    endpoint: "/ap/commercial/vehicles/export/sales",
    fields: [
      {
        name: "is_paid",
        label: "Estado de Pago",
        type: "select",
        required: false,
        placeholder: "Seleccionar estado",
        options: [
          { label: "Todos", value: "" },
          { label: "Pagado", value: "1" },
          { label: "Pendiente", value: "0" },
        ],
        defaultValue: "1",
      },
    ],
    defaultParams: {},
  },
];

export const REPORTS_CONSTANTS: ModelComplete = {
  ROUTE: "/ap/comercial/reportes",
  MODEL: {
    name: "Reportes Comerciales",
    gender: false,
    message: "Reportes Comerciales",
    plural: "Reportes Comerciales",
  },
  ENDPOINT: "/ap/comercial/reportes",
  ICON: "BarChart",
  QUERY_KEY: "commercial-reports",
  ROUTE_ADD: "/ap/comercial/reportes/nuevo",
  ROUTE_UPDATE: "/ap/comercial/reportes/editar",
  ABSOLUTE_ROUTE: "/ap/comercial/reportes",
};
