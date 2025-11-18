import { Links, Meta } from "@/shared/lib/pagination.interface";

export interface TypeOnboardingResponse {
  data: TypeOnboardingResource[];
  links: Links;
  meta: Meta;
}

export interface TypeOnboardingResource {
  id: number;
  name: string;
  status_deleted: boolean;
}

export interface TypeOnboardingRequest {
  name: string;
  type: string;
  status_deleted: boolean;
}

export interface getTypeOnboardingProps {
  params?: Record<string, any>;
}
