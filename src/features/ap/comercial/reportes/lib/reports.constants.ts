import { ModelComplete } from "@/core/core.interface";
import { ReportConfig } from "@/shared/lib/reports/reports.interface";
import { VEHICLE_STATUS_ID } from "@/features/ap/configuraciones/vehiculos/estados-vehiculo/lib/vehicleStatus.constants";
import { AREA_COMERCIAL } from "@/features/ap/ap-master/lib/apMaster.constants";
import {
  getFirstDayOfMonth,
  getTodayLocalDateString,
  toLocalDateString,
} from "@/core/core.function";

export const COMMERCIAL_REPORTS: ReportConfig[] = [
  {
    id: "vehicle-billing",
    title: "Reporte de Facturación de Vehículos",
    type: "Ventas",
    description:
      "Exporta el reporte de ventas de vehículos, según su estado, que pueden ser los estados: Vendido, En Proceso, Cancelado, etc. ",
    icon: "TrendingUp",
    endpoint: "/ap/commercial/vehicles/export/billing",
    fields: [
      {
        name: "fecha_de_emision",
        label: "Fecha de Emisión",
        type: "daterange",
        required: false,
        nameFrom: "fecha_de_emision_from",
        nameTo: "fecha_de_emision_to",
        rangeParamName: "fecha_de_emision",
        defaultValueFrom: toLocalDateString(getFirstDayOfMonth(new Date())),
        defaultValueTo: getTodayLocalDateString(),
      },
      {
        name: "sede_id",
        label: "Sede",
        type: "select",
        required: false,
        placeholder: "Seleccionar sede",
        endpoint: "/gp/mg/sede/my",
        optionsMapper: (data) =>
          (data ?? []).map((item: any) => ({
            label: item.abreviatura,
            value: String(item.id),
          })),
      },
    ],
    defaultParams: {},
  },
  {
    id: "vehicle-delivery",
    title: "Reporte de Entregas de Vehículos",
    type: "Entregas",
    description:
      "Exporta el reporte de entregas de vehículos, filtrando por estado de entrega, rango de fecha programada y sede.",
    icon: "Truck",
    endpoint: "/ap/commercial/vehiclesDelivery/export",
    method: "get",
    fields: [
      {
        name: "status_delivery",
        label: "Estado de Entrega",
        type: "select",
        required: false,
        placeholder: "Seleccionar estado",
        defaultValue: "delivered",
        options: [
          { label: "Todos", value: "all" },
          { label: "Pendientes", value: "pending" },
          { label: "Entregados", value: "delivered" },
        ],
      },
      {
        name: "scheduled_delivery_date",
        label: "Fecha de Entrega Programada",
        type: "daterange",
        required: false,
        nameFrom: "scheduled_delivery_date_from",
        nameTo: "scheduled_delivery_date_to",
        rangeParamName: "scheduled_delivery_date",
      },
      {
        name: "sede$shop_id",
        label: "Sede",
        type: "select",
        required: false,
        placeholder: "Seleccionar sede",
        endpoint: "/gp/mg/sede/my-shops",
        optionsMapper: (data) =>
          (data ?? []).map((item: any) => ({
            label: item.description,
            value: String(item.id),
          })),
      },
    ],
    defaultParams: {
      area_id: AREA_COMERCIAL,
    },
  },
  {
    id: "vehicle-inventory",
    title: "Reporte de Inventario de Vehículos",
    type: "Inventario",
    description:
      "Exporta el reporte de inventario de vehículos en estado Vehículo en Travesía, En Curso e Inventario VN, con días vencidos desde la emisión de la OC.",
    icon: "Warehouse",
    endpoint: "/ap/commercial/vehicles/export/inventory",
    fields: [
      {
        name: "emission_date",
        label: "Fecha de Emisión",
        type: "daterange",
        required: false,
        nameFrom: "emission_date_from",
        nameTo: "emission_date_to",
        rangeParamName: "emission_date",
      },
      {
        name: "sede_id",
        label: "Sede",
        type: "select",
        required: false,
        placeholder: "Seleccionar sede",
        endpoint: "/gp/mg/sede/my",
        optionsMapper: (data) =>
          (data ?? []).map((item: any) => ({
            label: item.abreviatura,
            value: String(item.id),
          })),
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
