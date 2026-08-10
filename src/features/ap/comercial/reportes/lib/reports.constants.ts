import { ModelComplete } from "@/core/core.interface";
import { ReportConfig } from "@/shared/lib/reports/reports.interface";
import {
  getFirstDayOfMonth,
  getTodayLocalDateString,
  toLocalDateString,
} from "@/core/core.function";
import { AREA_COMERCIAL } from "@/features/ap/ap-master/lib/apMaster.constants";
import {
  DOCUMENT_STATUS,
  MIGRATION_STATUS,
} from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.constants";

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
        defaultValue: "",
        options: [
          { label: "Todos", value: "" },
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
  {
    id: "purchase-request-quote",
    title: "Reporte de Solicitudes de Compra | Cotizaciones",
    type: "Compras",
    description:
      "Exporta el reporte de solicitudes de compra | cotizaciones de vehículos, filtrando por rango de fechas, modelo, marca, familia y sede.",
    icon: "FileSearch",
    endpoint: "/ap/commercial/reports/purchase-request-quote/export",
    method: "get",
    fields: [
      {
        name: "fecha",
        label: "Fecha",
        type: "daterange",
        required: true,
        nameFrom: "fecha_inicio",
        nameTo: "fecha_fin",
        defaultValueFrom: toLocalDateString(getFirstDayOfMonth(new Date())),
        defaultValueTo: getTodayLocalDateString(),
      },
      {
        name: "brand_id",
        label: "Marca",
        type: "multiselect",
        required: false,
        placeholder: "Seleccionar marca",
        endpoint: "/ap/configuration/vehicleBrand?all=true&status=1&type_operation_id=794",
        multiSelectMapper: (data) =>
          (data ?? []).map((item: any) => ({
            id: item.id,
            name: item.name,
          })),
      },
      {
        name: "family_id",
        label: "Familia",
        type: "multiselect",
        required: false,
        placeholder: "Seleccionar familia",
        endpoint: "/ap/configuration/families?all=true&status=1",
        multiSelectMapper: (data) =>
          (data ?? []).map((item: any) => ({
            id: item.id,
            name: item.description,
          })),
      },
      {
        name: "ap_models_vn_id",
        label: "Modelo",
        type: "multiselect",
        required: false,
        placeholder: "Seleccionar modelo",
        endpoint: "/ap/configuration/modelsVn?all=true&status=1",
        multiSelectMapper: (data) =>
          (data ?? []).map((item: any) => ({
            id: item.id,
            name: `${item.code} - ${item.version}`,
          })),
      },
      {
        name: "sede_id",
        label: "Sede",
        type: "multiselect",
        required: false,
        placeholder: "Seleccionar sede",
        endpoint: "/gp/mg/sede/my",
        multiSelectMapper: (data) =>
          (data ?? []).map((item: any) => ({
            id: item.id,
            name: item.abreviatura,
          })),
      },
    ],
    defaultParams: {},
  },
  {
    id: "advance-payments",
    title: "Reporte de Anticipos",
    type: "Facturación",
    description:
      "Exporta el reporte de comprobantes de anticipo del área comercial, filtrando por rango de fecha de emisión, estado, estado de migración, tipo de documento y sede.",
    icon: "FileText",
    endpoint: "/ap/facturacion/electronic-documents/export",
    method: "get",
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
        name: "status",
        label: "Estado",
        type: "select",
        required: false,
        placeholder: "Seleccionar estado",
        options: DOCUMENT_STATUS.map((status) => ({
          label: status.label,
          value: status.value,
        })),
      },
      {
        name: "migration_status",
        label: "Estado de Migración",
        type: "select",
        required: false,
        placeholder: "Seleccionar estado de migración",
        options: MIGRATION_STATUS.map((status) => ({
          label: status.label,
          value: status.value,
        })),
      },
      {
        name: "sunat_concept_document_type_id",
        label: "Tipo de Documento",
        type: "select",
        required: false,
        placeholder: "Seleccionar tipo de documento",
        endpoint:
          "/gp/mg/sunatConcepts?all=true&status=1&type=BILLING_DOCUMENT_TYPE",
        optionsMapper: (data) =>
          (data ?? []).map((item: any) => ({
            label: item.description,
            value: String(item.id),
          })),
      },
      {
        name: "seriesModel$sede_id",
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
    defaultParams: {
      is_advance_payment: 1,
      area_id: AREA_COMERCIAL,
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
