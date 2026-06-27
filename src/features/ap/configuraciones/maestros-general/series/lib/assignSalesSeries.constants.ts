import { type ModelComplete } from "@/core/core.interface";
import type { BadgeColor } from "@/components/ui/badge";
import { AssignSalesSeriesResource } from "./assignSalesSeries.interface";

const ROUTE = "series";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const ASSIGN_SALES_SERIES: ModelComplete<AssignSalesSeriesResource> = {
  MODEL: {
    name: "Asignar Serie de Venta",
    plural: "Asignar Series de Venta",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/assignSalesSeries",
  QUERY_KEY: "assignSalesSeries",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    series: "",
    correlative_start: 0,
    type_receipt_id: 0,
    type_operation_id: 0,
    sede_id: 0,
    status: true,
    type: "SALE",
  },
};

export const TYPE_RECEIPT_SERIES = {
  FACTURA: 799,
  BOLETA_VENTA: 800,
  NOTA_CREDITO: 801,
  NOTA_DEBITO: 802,
  GUIA_REMISION: 803,
};

export type SeriesType = "SALE" | "PURCHASE" | "GUIDES" | "OTHERS";

export const SERIES_TYPE_OPTIONS: { label: string; value: SeriesType }[] = [
  { label: "VENTA", value: "SALE" },
  { label: "COMPRA", value: "PURCHASE" },
  { label: "GUÍAS", value: "GUIDES" },
  { label: "OTROS", value: "OTHERS" },
];

export const SERIES_TYPE_CONFIG: Record<
  SeriesType,
  { label: string; color: BadgeColor }
> = {
  SALE: { label: "Venta", color: "green" },
  PURCHASE: { label: "Compra", color: "blue" },
  GUIDES: { label: "Guías", color: "orange" },
  OTHERS: { label: "Otros", color: "gray" },
};
