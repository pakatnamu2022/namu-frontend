import { api } from "@/core/api";
import {
  BulkQueryConfig,
  BulkQueryJobEnqueued,
  BulkQueryJobListResponse,
  BulkQueryJobStatus,
  BulkQueryJobStatusResponse,
  BulkQueryResultBase,
} from "./bulkQueries.interface";

async function sendBulkQueryFile<T>(
  endpoint: string,
  file: File,
  fileFieldName: string
): Promise<T> {
  const formData = new FormData();
  formData.append(fileFieldName, file);
  const { data } = await api.post<T>(endpoint, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function previewBulkQuery<T extends BulkQueryResultBase>(
  config: BulkQueryConfig,
  file: File
): Promise<T> {
  if (!config.previewEndpoint) {
    throw new Error(`"${config.title}" no tiene endpoint de previsualización`);
  }
  return sendBulkQueryFile<T>(
    config.previewEndpoint,
    file,
    config.fileFieldName ?? "file"
  );
}

// Modo "sync": procesa y retorna el resultado final directamente
export async function processBulkQuery<T extends BulkQueryResultBase>(
  config: BulkQueryConfig,
  file: File
): Promise<T> {
  return sendBulkQueryFile<T>(
    config.processEndpoint,
    file,
    config.fileFieldName ?? "file"
  );
}

// Modo "async": sube el archivo y lo encola, retorna el job_id
export async function enqueueBulkQuery(
  config: BulkQueryConfig,
  file: File
): Promise<BulkQueryJobEnqueued> {
  return sendBulkQueryFile<BulkQueryJobEnqueued>(
    config.processEndpoint,
    file,
    config.fileFieldName ?? "file"
  );
}

// Modo "async": consulta el estado actual de un job
export async function getBulkQueryJobStatus(
  config: BulkQueryConfig,
  jobId: string | number
): Promise<BulkQueryJobStatusResponse> {
  if (!config.statusEndpoint) {
    throw new Error(`"${config.title}" no tiene endpoint de estado`);
  }
  const { data } = await api.get<BulkQueryJobStatusResponse>(
    config.statusEndpoint(jobId)
  );
  return data;
}

// Modo "async": descarga el archivo procesado como Blob
export async function downloadBulkQueryFile(
  config: BulkQueryConfig,
  jobId: string | number
): Promise<Blob> {
  if (!config.downloadEndpoint) {
    throw new Error(`"${config.title}" no tiene endpoint de descarga`);
  }
  const { data } = await api.get(config.downloadEndpoint(jobId), {
    responseType: "blob",
  });
  return data;
}

// Modo "async": lista el historial de jobs/archivos del usuario
export async function listBulkQueryJobs(
  config: BulkQueryConfig,
  params?: { status?: BulkQueryJobStatus; page?: number; perPage?: number }
): Promise<BulkQueryJobListResponse> {
  if (!config.listJobsEndpoint) {
    throw new Error(`"${config.title}" no tiene endpoint de listado`);
  }
  const { data } = await api.get<BulkQueryJobListResponse>(
    config.listJobsEndpoint,
    {
      params: {
        status: params?.status,
        page: params?.page,
        per_page: params?.perPage,
      },
    }
  );
  return data;
}
