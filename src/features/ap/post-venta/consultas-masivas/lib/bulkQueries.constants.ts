import { ModelComplete } from "@/core/core.interface";
import { BulkQueryConfig } from "@/shared/lib/bulk-queries/bulkQueries.interface";

// Catálogo de consultas/procesos masivos de Post Venta. Para agregar un
// nuevo tipo (ej. datos de SIAN) basta con sumar un objeto BulkQueryConfig
// aquí: la grilla y el formulario de carga son 100% genéricos. Cada entrada
// puede ser "sync" (respuesta inmediata) o "async" (Job en cola + polling).
export const POST_VENTA_BULK_QUERIES: BulkQueryConfig[] = [
  {
    id: "vehicle-leakage",
    title: "Fugado / Fuga Temprana",
    description:
      "Enriquece un archivo Excel de vehículos con la información de fugado o fuga temprana.",
    icon: "CarFront",
    accept: ".xlsx,.xls",
    helpText:
      "Sube el archivo Excel (.xlsx o .xls) de hasta 50MB con los vehículos a enriquecer. El procesamiento se hace en segundo plano.",
    mode: "async",
    processEndpoint: "ap/postVenta/vehicle-leakage/process",
    listJobsEndpoint: "ap/postVenta/vehicle-leakage/jobs",
    statusEndpoint: (jobId) => `ap/postVenta/vehicle-leakage/status/${jobId}`,
    downloadEndpoint: (jobId) =>
      `ap/postVenta/vehicle-leakage/download/${jobId}`,
    pollingIntervalMs: 5000,
  },
];

export const POST_VENTA_BULK_QUERIES_CONSTANTS: ModelComplete = {
  ROUTE: "/ap/post-venta/indicadores-y-reportes/consultas-masivas",
  MODEL: {
    name: "Consultas Masivas",
    gender: true,
    message: "Consultas Masivas",
    plural: "Consultas Masivas",
  },
  ENDPOINT: "/vehicle-leakage",
  ICON: "FileSearch",
  QUERY_KEY: "post-venta-bulk-queries",
  ROUTE_ADD: "",
  ROUTE_UPDATE: "",
  ABSOLUTE_ROUTE: "/ap/post-venta/indicadores-y-reportes/consultas-masivas",
};
