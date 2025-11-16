import { ModelComplete } from "@/core/core.interface";
import {
  OpportunityActionSchema,
  OpportunitySchema,
} from "./opportunities.schema";
import { Mail, MessageCircle, Phone, Users, Video } from "lucide-react";
import { AGENDA } from "../../agenda/lib/agenda.constants";

const ROUTE = "oportunidades";
const { ROUTE: ROUTE_AGENDA } = AGENDA;

export const OPPORTUNITIES: ModelComplete<OpportunitySchema> = {
  MODEL: {
    name: "Oportunidad",
    plural: "Oportunidades",
    gender: false,
  },
  ICON: "BriefcaseBusiness",
  ENDPOINT: "/ap/commercial/opportunities",
  QUERY_KEY: "opportunities",
  ROUTE,
  ABSOLUTE_ROUTE: `/ap/comercial/${ROUTE_AGENDA}/${ROUTE}`,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
  EMPTY: {
    client_id: "",
    family_id: "",
    opportunity_type_id: "",
    client_status_id: "",
    opportunity_status_id: "",
  },
};

export const OPPORTUNITY_ACTIONS: ModelComplete<OpportunityActionSchema> = {
  MODEL: {
    name: "Acción",
    plural: "Acciones",
    gender: false,
  },
  ICON: "Activity",
  ENDPOINT: "/ap/commercial/opportunityActions",
  QUERY_KEY: "opportunityActions",
  ROUTE: "acciones",
  ROUTE_ADD: `acciones/agregar`,
  EMPTY: {
    opportunity_id: "",
    action_type_id: "",
    action_contact_type_id: "",
    description: "",
    result: false,
  },
};

export const OPPORTUNITY_FRIA = "FRIO";
export const OPPORTUNITY_TEMPLADA = "TEMPLADA";
export const OPPORTUNITY_CALIENTE = "CALIENTE";
export const OPPORTUNITY_VENDIDA = "VENDIDA";
export const OPPORTUNITY_CERRADA = "CERRADA";

export const BG_OPPORTUNITY: Record<string, string> = {
  [OPPORTUNITY_FRIA]: "bg-blue-500/5",
  [OPPORTUNITY_TEMPLADA]: "bg-yellow-500/5",
  [OPPORTUNITY_CALIENTE]: "bg-orange-500/5",
  [OPPORTUNITY_VENDIDA]: "bg-green-600/5",
  [OPPORTUNITY_CERRADA]: "bg-gray-500/5",
};

export const BG_TEXT_OPPORTUNITY: Record<string, string> = {
  [OPPORTUNITY_FRIA]: "bg-blue-500/15",
  [OPPORTUNITY_TEMPLADA]: "bg-yellow-500/15",
  [OPPORTUNITY_CALIENTE]: "bg-orange-500/15",
  [OPPORTUNITY_VENDIDA]: "bg-green-600/15",
  [OPPORTUNITY_CERRADA]: "bg-gray-500/15",
};

export const TEXT_OPPORTUNITY: Record<string, string> = {
  [OPPORTUNITY_FRIA]: "text-blue-600",
  [OPPORTUNITY_TEMPLADA]: "text-yellow-600",
  [OPPORTUNITY_CALIENTE]: "text-orange-700",
  [OPPORTUNITY_VENDIDA]: "text-green-700",
  [OPPORTUNITY_CERRADA]: "text-gray-800",
};

export const BORDER_OPPORTUNITY: Record<string, string> = {
  [OPPORTUNITY_FRIA]: "border-blue-600/15",
  [OPPORTUNITY_TEMPLADA]: "border-yellow-600/15",
  [OPPORTUNITY_CALIENTE]: "border-orange-600/15",
  [OPPORTUNITY_VENDIDA]: "border-green-600/15",
  [OPPORTUNITY_CERRADA]: "border-gray-600/15",
};

export const SHADOW_OPPORTUNITY: Record<string, string> = {
  [OPPORTUNITY_FRIA]: "shadow-none shadow-blue-500/10",
  [OPPORTUNITY_TEMPLADA]: "shadow-none shadow-yellow-500/10",
  [OPPORTUNITY_CALIENTE]: "shadow-none shadow-orange-500/10",
  [OPPORTUNITY_VENDIDA]: "shadow-none shadow-green-500/10",
  [OPPORTUNITY_CERRADA]: "shadow-none shadow-gray-500/10",
};

export const HOVER_OPPORTUNITY: Record<string, string> = {
  [OPPORTUNITY_FRIA]: "hover:bg-blue-200/10",
  [OPPORTUNITY_TEMPLADA]: "hover:bg-yellow-200/10",
  [OPPORTUNITY_CALIENTE]: "hover:bg-orange-200/10",
  [OPPORTUNITY_VENDIDA]: "hover:bg-green-200/10",
  [OPPORTUNITY_CERRADA]: "hover:bg-gray-200/10",
};

export const OPPORTUNITY_STATUS_COLORS: Record<string, string> = {
  [OPPORTUNITY_FRIA]: `${BG_OPPORTUNITY[OPPORTUNITY_FRIA]} ${TEXT_OPPORTUNITY[OPPORTUNITY_FRIA]}`,
  [OPPORTUNITY_TEMPLADA]: `${BG_OPPORTUNITY[OPPORTUNITY_TEMPLADA]} ${TEXT_OPPORTUNITY[OPPORTUNITY_TEMPLADA]}`,
  [OPPORTUNITY_CALIENTE]: `${BG_OPPORTUNITY[OPPORTUNITY_CALIENTE]} ${TEXT_OPPORTUNITY[OPPORTUNITY_CALIENTE]}`,
  [OPPORTUNITY_VENDIDA]: `${BG_OPPORTUNITY[OPPORTUNITY_VENDIDA]} ${TEXT_OPPORTUNITY[OPPORTUNITY_VENDIDA]}`,
  [OPPORTUNITY_CERRADA]: `${BG_OPPORTUNITY[OPPORTUNITY_CERRADA]} ${TEXT_OPPORTUNITY[OPPORTUNITY_CERRADA]}`,
};

export const TEXT_OPPORTUNITY_STATUS_COLORS: Record<string, string> = {
  [OPPORTUNITY_FRIA]: "text-blue-600",
  [OPPORTUNITY_TEMPLADA]: "text-yellow-600",
  [OPPORTUNITY_CALIENTE]: "text-orange-600",
  [OPPORTUNITY_VENDIDA]: "text-green-600",
  [OPPORTUNITY_CERRADA]: "text-gray-700",
};

export const HOVER_TEXT_OPPORTUNITY_STATUS_COLORS: Record<string, string> = {
  [OPPORTUNITY_FRIA]: "hover:text-blue-600 hover:bg-blue-600/10",
  [OPPORTUNITY_TEMPLADA]: "hover:text-yellow-600 hover:bg-yellow-600/10",
  [OPPORTUNITY_CALIENTE]: "hover:text-orange-600 hover:bg-orange-600/10",
  [OPPORTUNITY_VENDIDA]: "hover:text-green-600 hover:bg-green-600/10",
  [OPPORTUNITY_CERRADA]: "hover:text-gray-700 hover:bg-gray-500/10",
};

export const OPPORTUNITIES_COLUMNS = [
  {
    id: OPPORTUNITY_FRIA,
    name: "Frías",
    bgColor: BG_OPPORTUNITY[OPPORTUNITY_FRIA],
    bgTextColor: BG_TEXT_OPPORTUNITY[OPPORTUNITY_FRIA],
    borderColor: BORDER_OPPORTUNITY[OPPORTUNITY_FRIA],
    textColor: TEXT_OPPORTUNITY[OPPORTUNITY_FRIA],
    shadowColor: SHADOW_OPPORTUNITY[OPPORTUNITY_FRIA],
    hoverColor: HOVER_OPPORTUNITY[OPPORTUNITY_FRIA],
    canEdit: true,
  },
  {
    id: OPPORTUNITY_TEMPLADA,
    name: "Templadas",
    bgColor: BG_OPPORTUNITY[OPPORTUNITY_TEMPLADA],
    bgTextColor: BG_TEXT_OPPORTUNITY[OPPORTUNITY_TEMPLADA],
    borderColor: BORDER_OPPORTUNITY[OPPORTUNITY_TEMPLADA],
    textColor: TEXT_OPPORTUNITY[OPPORTUNITY_TEMPLADA],
    shadowColor: SHADOW_OPPORTUNITY[OPPORTUNITY_TEMPLADA],
    hoverColor: HOVER_OPPORTUNITY[OPPORTUNITY_TEMPLADA],
    canEdit: true,
  },
  {
    id: OPPORTUNITY_CALIENTE,
    name: "Calientes",
    bgColor: BG_OPPORTUNITY[OPPORTUNITY_CALIENTE],
    bgTextColor: BG_TEXT_OPPORTUNITY[OPPORTUNITY_CALIENTE],
    borderColor: BORDER_OPPORTUNITY[OPPORTUNITY_CALIENTE],
    textColor: TEXT_OPPORTUNITY[OPPORTUNITY_CALIENTE],
    shadowColor: SHADOW_OPPORTUNITY[OPPORTUNITY_CALIENTE],
    hoverColor: HOVER_OPPORTUNITY[OPPORTUNITY_CALIENTE],
    canEdit: true,
  },
  {
    id: OPPORTUNITY_VENDIDA,
    name: "Ventas Concretadas",
    bgColor: BG_OPPORTUNITY[OPPORTUNITY_VENDIDA],
    bgTextColor: BG_TEXT_OPPORTUNITY[OPPORTUNITY_VENDIDA],
    borderColor: BORDER_OPPORTUNITY[OPPORTUNITY_VENDIDA],
    textColor: TEXT_OPPORTUNITY[OPPORTUNITY_VENDIDA],
    shadowColor: SHADOW_OPPORTUNITY[OPPORTUNITY_VENDIDA],
    hoverColor: HOVER_OPPORTUNITY[OPPORTUNITY_VENDIDA],
    canEdit: false,
  },
  {
    id: OPPORTUNITY_CERRADA,
    name: "Cerradas",
    bgColor: BG_OPPORTUNITY[OPPORTUNITY_CERRADA],
    bgTextColor: BG_TEXT_OPPORTUNITY[OPPORTUNITY_CERRADA],
    borderColor: BORDER_OPPORTUNITY[OPPORTUNITY_CERRADA],
    textColor: TEXT_OPPORTUNITY[OPPORTUNITY_CERRADA],
    shadowColor: SHADOW_OPPORTUNITY[OPPORTUNITY_CERRADA],
    hoverColor: HOVER_OPPORTUNITY[OPPORTUNITY_CERRADA],
    canEdit: false,
  },
];

// Contact type icons mapping to lucide-react icon names
export const CONTACT_TYPE_ICONS: Record<string, string> = {
  EMAIL: "Mail",
  TELEFONO: "Phone",
  REUNION: "Users",
  VIDEOLLAMADA: "Video",
  WHATSAPP: "MessageCircle",
};

// Helper function to get icon component
export const getContactIcon = (type: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Mail,
    Phone,
    Users,
    Video,
    MessageCircle,
  };

  const iconName = CONTACT_TYPE_ICONS[type];
  return iconMap[iconName] || MessageCircle;
};

// Master types
export const MASTER_TYPES = {
  OPPORTUNITY_STATUS: "OPPORTUNITY_STATUS",
  CLIENT_STATUS: "STATUS_CLIENT",
  OPPORTUNITY_TYPE: "OPPORTUNITY_TYPE",
  ACTION_TYPE: "ACTION_TYPE",
  ACTION_CONTACT_TYPE: "ACTION_CONTACT_TYPE",
} as const;
