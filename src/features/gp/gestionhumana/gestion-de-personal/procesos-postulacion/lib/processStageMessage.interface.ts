export interface ProcessStageMessageResource {
  etapa: string;
  label: string;
  asunto: string | null;
  contenido: string | null;
  activo: boolean;
}

export interface UpdateProcessStageMessagePayload {
  asunto: string;
  contenido: string;
  activo: boolean;
}
