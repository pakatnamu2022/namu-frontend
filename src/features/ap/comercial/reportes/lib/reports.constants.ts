import { ModelComplete } from "@/core/core.interface";
import { ReportConfig } from "./reports.interface";
import { VEHICLE_STATUS_ID } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.constants";

export const COMMERCIAL_REPORTS: ReportConfig[] = [
  {
    id: "vehicle-sales",
    title: "Reporte de Ventas de Vehículos",
    description: "Exporta el reporte de ventas de vehículos",
    icon: "TrendingUp",
    endpoint: "/ap/commercial/vehicles/export/sales",
    fields: [
      {
        name: "ap_vehicle_status_id",
        label: "Estado de Vehículo",
        type: "select",
        required: false,
        placeholder: "Seleccionar estado",
        options: Object.entries(VEHICLE_STATUS_ID).map(([key, value]) => ({
          label: key.replace(/_/g, " "),
          value: value.toString(),
        })),
        defaultValue: "6",
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
