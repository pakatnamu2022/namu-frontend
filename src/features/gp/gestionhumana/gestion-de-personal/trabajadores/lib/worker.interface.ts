import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";

export interface WorkerResponse {
  data: WorkerResource[];
  links: Links;
  meta: Meta;
}

export interface WorkerResource {
  id: number;
  supervisor_id?: number;
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

export interface PersonBirthdayResponse {
  data: PersonBirthdayResource[];
  links: Links;
  meta: Meta;
}

export interface PersonBirthdayResource {
  id: number;
  nombre_completo: string;
  photo: string;
  position: string;
  days_to_birthday: number;
  fecha_nacimiento: string;
}
