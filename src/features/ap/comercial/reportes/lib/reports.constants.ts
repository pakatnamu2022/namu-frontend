import { ModelComplete } from "@/core/core.interface";
import { ReportConfig } from "./reports.interface";
import { VEHICLE_STATUS_ID } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.constants";
import { CM_COMERCIAL_ID, CM_POSTVENTA_ID } from "@/features/ap/ap-master/lib/apMaster.constants";

export const COMMERCIAL_REPORTS: ReportConfig[] = [
  {
    id: "vehicle-sales",
    title: "Reporte de Ventas de Vehículos",
    type: "Ventas",
    description:
      "Exporta el reporte de ventas de vehículos, según su estado, que pueden ser los estados: Vendido, En Proceso, Cancelado, etc. ",
    icon: "TrendingUp",
    endpoint: "/ap/commercial/vehicles/export/sales",
    fields: [
      {
        name: "ap_vehicle_status_id",
        label: "Estado de Vehículo",
        type: "multiselect",
        required: false,
        placeholder: "Seleccionar estados",
        multiSelectOptions: Object.entries(VEHICLE_STATUS_ID).map(
          ([key, value]) => ({
            id: value,
            name: key.replace(/_/g, " "),
          }),
        ),
        getDisplayValue: (item) => item.name,
        defaultValue: [6],
      },
    ],
    defaultParams: {},
  },
  {
    id: "vehicle-delivery",
    title: "Reporte de Entregas de Vehículos",
    type: "Entregas",
    description:
      "Exporta el reporte de entregas de vehículos por modelo, almacén y tipo de operación.",
    icon: "Truck",
    endpoint: "/ap/commercial/vehicles/export/delivery",
    fields: [
      {
        name: "ap_models_vn_id",
        label: "Modelo de Vehículo",
        type: "select",
        required: false,
        placeholder: "Seleccionar modelo",
        endpoint: "/ap/configuration/modelsVn",
        optionsMapper: (data) =>
          (data?.data ?? []).map((item: any) => ({
            label: item.version,
            value: String(item.id),
          })),
      },
      {
        name: "warehouse_id",
        label: "Almacén",
        type: "select",
        required: false,
        placeholder: "Seleccionar almacén",
        endpoint: "/ap/configuration/warehouse",
        optionsMapper: (data) =>
          (data?.data ?? []).map((item: any) => ({
            label: item.description,
            value: String(item.id),
          })),
      },
      {
        name: "type_operation_id",
        label: "Tipo de Operación",
        type: "select",
        required: false,
        placeholder: "Seleccionar tipo de operación",
        options: [
          { label: "Comercial", value: String(CM_COMERCIAL_ID) },
          { label: "Post Venta", value: String(CM_POSTVENTA_ID) },
        ],
      },
    ],
    defaultParams: {
      has_vehicle_delivery: true,
    },
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
