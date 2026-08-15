import { type ModelComplete } from "@/core/core.interface.ts";
import { type BadgeColor } from "@/components/ui/badge";
import { OrderQuotationDetailsResource } from "./proformaDetails.interface";
const ROUTE = "cotizacion-detalle";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const ORDER_QUOTATION_DETAILS: ModelComplete<OrderQuotationDetailsResource> =
  {
    MODEL: {
      name: "Item de Cotización",
      plural: "Items de Cotización",
      gender: false,
    },
    ICON: "FileText",
    ENDPOINT: "/ap/postVenta/orderQuotationDetails",
    QUERY_KEY: "orderQuotationDetails",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  };

export const ITEM_TYPE_PRODUCT = "product";
export const ITEM_TYPE_LABOR = "labor";
export const ITEM_TYPE_MATERIAL = "material";

export const DESCRIPTION_MATERIALES = "Materiales";

export const ITEM_TYPE_OPTIONS = [
  { label: "Mano de Obra", value: ITEM_TYPE_LABOR },
  { label: "Materiales", value: ITEM_TYPE_MATERIAL },
];

export const ITEM_TYPE_TRANSLATOR: Record<
  string,
  { label: string; color: BadgeColor }
> = {
  [ITEM_TYPE_LABOR]: { label: "Mano de Obra", color: "blue" },
  [ITEM_TYPE_MATERIAL]: { label: "Materiales", color: "orange" },
};

export const onSelectSupplyType = [
  { label: "Stock", value: "STOCK" },
  { label: "Traslado", value: "TRASLADO" },
  { label: "Local", value: "LOCAL" },
  { label: "Central", value: "CENTRAL" },
  { label: "Importación", value: "IMPORTACION" },
  { label: "Central e Importación", value: "CENTRAL_IMPORTACION" },
];
