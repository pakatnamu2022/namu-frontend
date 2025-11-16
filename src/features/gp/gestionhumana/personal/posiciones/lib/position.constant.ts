import { ModelComplete } from "@/src/core/core.interface";

const ROUTE = "posiciones";

export const POSITION: ModelComplete = {
  MODEL: {
    name: "Posición",
    plural: "Posiciones",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/gh/personal/position",
  QUERY_KEY: "position",
  ROUTE,
  ROUTE_ADD: `${ROUTE}/agregar`,
  ROUTE_UPDATE: `${ROUTE}/actualizar`,
};

export const POSITION_TYPE = {
  CONSULTANT: [60, 80, 83, 103, 108, 111, 112, 119, 244, 245, 332, 328], // ASESOR
  GENERAL_MANAGER: [23, 235, 255],
  SALES_MANAGER: [58, 105, 122, 217],
  SALES_BOSS: [61, 82, 107, 114, 124, 155, 168, 327, 331, 353, 354],
  BOX_OFFICE: [54, 102, 118, 148, 158, 170, 183, 192, 205, 285, 306],
  SALES_COORDINATOR: [59, 81, 101, 104, 110, 121],
  TICS: [38, 39, 40, 273, 280, 281, 317, 345, 356],
};

export const STATUS_WORKER = {
  ACTIVE: 22,
};
