// Forma genérica para cualquier "consulta/proceso masivo" que reciba un
// archivo (hoy Excel) y lo procese, ya sea de forma síncrona (respuesta
// inmediata) o asíncrona (encolado con Job + polling + descarga).
// Agregar un nuevo tipo de consulta (ej. datos de SIAN) es agregar un
// objeto BulkQueryConfig nuevo, sin tocar los componentes genéricos.

export type BulkQueryMode = "sync" | "async";

export interface BulkQueryResultBase {
  success: boolean;
  message: string;
  [key: string]: any;
}

// Respuesta al encolar un archivo (POST /process en modo async)
export interface BulkQueryJobEnqueued {
  success: boolean;
  message: string;
  data: {
    job_id: number | string;
    status: BulkQueryJobStatus;
    original_filename?: string;
    [key: string]: any;
  };
}

export type BulkQueryJobStatus = "pending" | "processing" | "completed" | "failed";

export interface BulkQueryJobResults {
  processed?: number;
  enriched?: number;
  not_found?: number;
  errors?: string[];
  [key: string]: any;
}

export interface BulkQueryJob {
  job_id: number | string;
  status: BulkQueryJobStatus;
  original_filename?: string;
  filename?: string;
  created_at?: string;
  started_at?: string | null;
  completed_at?: string | null;
  error_message?: string;
  results?: BulkQueryJobResults;
  download_url?: string;
  [key: string]: any;
}

// Respuesta al consultar el estado de un job (GET /status/{jobId})
export interface BulkQueryJobStatusResponse {
  success: boolean;
  message?: string;
  data: BulkQueryJob;
}

// Respuesta al listar los jobs del usuario (GET /jobs)
export interface BulkQueryJobListResponse {
  success: boolean;
  message?: string;
  data: BulkQueryJob[];
  meta?: {
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    [key: string]: any;
  };
}

export interface BulkQueryConfig {
  id: string;
  title: string;
  description: string;
  icon?: string;
  // Nombre de la sección/subtítulo bajo la cual se agrupa en el grid
  section?: string;
  // Extensiones aceptadas por el input de archivo (por defecto Excel)
  accept?: string;
  // Texto de ayuda mostrado sobre el input de archivo
  helpText?: string;
  // "sync" (por defecto): el processEndpoint responde con el resultado final.
  // "async": el processEndpoint encola un Job y hay que hacer polling a
  // statusEndpoint(jobId) hasta que status sea "completed" o "failed".
  mode?: BulkQueryMode;
  // Endpoint para previsualizar el archivo sin persistir cambios (solo modo "sync").
  // Si no se indica, el flujo va directo a "procesar".
  previewEndpoint?: string;
  // Endpoint que procesa/persiste el archivo, o que encola el Job (modo "async")
  processEndpoint: string;
  // Modo "async": arma la URL de consulta de estado a partir del jobId
  statusEndpoint?: (jobId: string | number) => string;
  // Modo "async": arma la URL de descarga del archivo procesado a partir del jobId
  downloadEndpoint?: (jobId: string | number) => string;
  // Modo "async": endpoint que lista los jobs/archivos previos del usuario.
  // Si se indica, la tarjeta muestra un historial además del formulario de carga.
  listJobsEndpoint?: string;
  // Modo "async": intervalo de polling en ms (por defecto 5000)
  pollingIntervalMs?: number;
  // Nombre del campo del FormData que recibe el archivo. Por defecto: "file"
  fileFieldName?: string;
}
