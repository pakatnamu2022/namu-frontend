import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface OpportunityActionResponse {
  data: OpportunityActionResource[];
  links: Links;
  meta: Meta;
}

export interface OpportunityActionResource {
  id: number;
  opportunity_id: number;
  action_type_id: number;
  action_contact_type_id: number;
  datetime: string;
  description: string;
  result: boolean;
  action_type: string;
  action_contact_type: string;
  client: string;
}
