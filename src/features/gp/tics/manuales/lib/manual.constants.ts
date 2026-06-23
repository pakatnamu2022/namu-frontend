import { type ModelComplete } from "@/core/core.interface";
import { ManualResource } from "./manual.interface";

const ROUTE = "gestion-manuales";
const ABSOLUTE_ROUTE = `/gp/tics/${ROUTE}`;

export const MANUAL: ModelComplete<ManualResource> = {
  MODEL: {
    name: "Manual",
    plural: "Manuales",
    gender: false,
  },
  ICON: "BookOpen",
  ENDPOINT: "/manuals",
  QUERY_KEY: "manualsAdmin",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    vista_id: 0,
    company_slug: "",
    module_slug: "",
    title: "",
    description: null,
    s3_url: "",
    order: 0,
    created_at: "",
  },
};
