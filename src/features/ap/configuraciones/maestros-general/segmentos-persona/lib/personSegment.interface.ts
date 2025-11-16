import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface PersonSegmentResponse {
  data: PersonSegmentResource[];
  links: Links;
  meta: Meta;
}

export interface PersonSegmentResource {
  id: number;
  description: string;
  type: string;
  status: boolean;
}

export interface PersonSegmentRequest {
  description: string;
  type: string;
  status: boolean;
}

export interface getPersonSegmentProps {
  params?: Record<string, any>;
}