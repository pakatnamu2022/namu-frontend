export interface ApplicantStatusMessageResource {
  tipo_trabajador_id: number;
  label: string;
  asunto: string | null;
  contenido: string | null;
  activo: boolean;
}

export interface UpdateApplicantStatusMessagePayload {
  asunto: string;
  contenido: string;
  activo: boolean;
}
