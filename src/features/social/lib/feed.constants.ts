import { ModelComplete } from "@/core/core.interface";

export const FEED: ModelComplete = {
  ABSOLUTE_ROUTE: "/feed",
  ENDPOINT: "/social/feed",
  ICON: "AArrowDownIcon",
  MODEL: {
    gender: false,
    plural: "Feed",
    name: "Feed",
    message: "Feed",
  },
  QUERY_KEY: "feed",
  ROUTE: "/feed",
  ROUTE_ADD: "/feed/add",
  ROUTE_UPDATE: "/feed/update",
};
