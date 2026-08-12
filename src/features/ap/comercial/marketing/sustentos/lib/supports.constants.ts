import { type ModelComplete, type Option } from "@/core/core.interface";
import { SupportsResource } from "./supports.interface";

const ROUTE = "sustentos";
const ABSOLUTE_ROUTE = `/ap/comercial/marketing/${ROUTE}`;

export const SUPPORTS: ModelComplete<SupportsResource> = {
  MODEL: {
    name: "Sustento",
    plural: "Sustentos",
    gender: false,
  },
  ICON: "Receipt",
  ENDPOINT: "/marketing/supports",
  QUERY_KEY: "marketing-supports",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const SUPPORT_TYPE_OPTIONS: Option[] = [
  { label: "Recibo", value: "receipt" },
  { label: "Factura", value: "invoice" },
  { label: "Foto", value: "photo" },
  { label: "Informe", value: "report" },
  { label: "Otro", value: "other" },
];
