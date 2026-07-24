import { type ModelComplete, type Option } from "@/core/core.interface";
import { CampaignResource } from "./campaign.interface";

const ROUTE = "campanas";
const ABSOLUTE_ROUTE = `/ap/configuraciones/maestros-general/${ROUTE}`;

export const CAMPAIGN: ModelComplete<CampaignResource> = {
  MODEL: {
    name: "Campaña",
    plural: "Campañas",
    gender: true,
  },
  ICON: "Megaphone",
  ENDPOINT: "/ap/configuration/campaigns",
  QUERY_KEY: "campaign",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

export const DISCOUNT_TYPE_OPTIONS: Option[] = [
  { value: "fixed", label: "Fijo" },
  { value: "percentage", label: "Porcentaje" },
];

/**
 * ID de la clase de artículo "Lubricantes" (ap_class_article_id).
 * El descuento por campaña se omite para productos de esta clase.
 */
export const AP_CLASS_ARTICLE_LUBRICANT_ID = 8;
