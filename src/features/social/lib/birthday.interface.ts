import { Links, Meta } from "@/shared/lib/pagination.interface";

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
