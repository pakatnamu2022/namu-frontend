import { type ModelComplete } from "@/core/core.interface.ts";
import { CampaignScheduleResource } from "./campaignSchedule.interface";

const ROUTE = "cronograma-campanas";
const ABSOLUTE_ROUTE = `/ap/post-venta/taller/${ROUTE}`;

export const CAMPAIGN_SCHEDULE: ModelComplete<CampaignScheduleResource> = {
  MODEL: {
    name: "Cronograma de Campaña",
    plural: "Cronogramas de Campaña",
    gender: false,
  },
  ICON: "CalendarDays",
  ENDPOINT: "/ap/postVenta/campaignSchedules",
  QUERY_KEY: "campaignSchedule",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
