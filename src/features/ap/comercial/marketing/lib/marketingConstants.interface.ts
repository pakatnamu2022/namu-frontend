import { type Option } from "@/core/core.interface";

export interface MarketingConstantsResource {
  plan_statuses: Option[];
  budget_types: Option[];
  budget_statuses: Option[];
  activity_statuses: Option[];
  proposal_statuses: Option[];
  purchase_order_statuses: Option[];
  support_types: Option[];
}
