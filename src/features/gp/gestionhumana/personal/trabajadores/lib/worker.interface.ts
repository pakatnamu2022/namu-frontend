import { Links, Meta } from "@/src/shared/lib/pagination.interface";

export interface WorkerResponse {
  data: WorkerResource[];
  links: Links;
  meta: Meta;
}

export interface WorkerResource {
  id: number;
  name: string;
  document: string;
  sede: string;
  position: string;
  offerLetterConfirmationId: number;
  emailOfferLetterStatusId: number;
  offerLetterConfirmation: string;
  emailOfferLetterStatus: string;
  photo: string;
  inclusion_reason?: string;
  has_category?: boolean;
  has_objectives?: boolean;
  has_competences?: boolean;
}

export interface getWorkersProps {
  params?: Record<string, any>;
}
