"use client";

import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { errorToast } from "@/core/core.function";
import {
  BulkQueryConfig,
  BulkQueryJob,
} from "@/shared/lib/bulk-queries/bulkQueries.interface";
import {
  downloadBulkQueryFile,
  listBulkQueryJobs,
} from "@/shared/lib/bulk-queries/bulkQueries.actions";

interface BulkQueryJobsListProps {
  query: BulkQueryConfig;
  // Se incrementa cada vez que se encola un archivo nuevo, para forzar refresh
  refreshSignal: number;
}

const STATUS_LABEL: Record<BulkQueryJob["status"], string> = {
  pending: "En cola",
  processing: "Procesando...",
  completed: "Completado",
  failed: "Error",
};

export function BulkQueryJobsList({ query, refreshSignal }: BulkQueryJobsListProps) {
  const [jobs, setJobs] = useState<BulkQueryJob[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | number | null>(null);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchJobs = async (showSpinner = false) => {
    if (showSpinner) setIsLoading(true);
    try {
      const res = await listBulkQueryJobs(query);
      setJobs(res.data ?? []);
    } catch (error: any) {
      if (showSpinner) {
        errorToast(error?.response?.data?.message || "Error al listar los archivos");
      }
    } finally {
      if (showSpinner) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  useEffect(() => {
    const hasActiveJobs = jobs.some(
      (job) => job.status === "pending" || job.status === "processing"
    );

    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    if (hasActiveJobs) {
      pollingRef.current = setInterval(() => {
        fetchJobs(false);
      }, query.pollingIntervalMs ?? 5000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobs]);

  const handleDownload = async (job: BulkQueryJob) => {
    setDownloadingId(job.job_id);
    try {
      const blob = await downloadBulkQueryFile(query, job.job_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = job.original_filename || job.filename
        ? `enriquecido_${job.original_filename ?? job.filename}`
        : "archivo_procesado.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "Error al descargar el archivo");
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        Cargando archivos...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold">Mis Archivos Procesados</h4>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fetchJobs(true)}
        >
          <RefreshCw className="size-3.5" />
        </Button>
      </div>

      {jobs.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">
          Aún no has subido archivos.
        </p>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <div
              key={job.job_id}
              className="flex items-start gap-3 rounded-lg border p-3"
            >
              <div className="mt-0.5 shrink-0">
                {job.status === "completed" && (
                  <CheckCircle2 className="size-5 text-green-600" />
                )}
                {job.status === "failed" && (
                  <AlertCircle className="size-5 text-red-600" />
                )}
                {(job.status === "pending" || job.status === "processing") && (
                  <Loader2 className="size-5 animate-spin text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {job.original_filename ?? job.filename ?? `Archivo #${job.job_id}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {STATUS_LABEL[job.status]}
                  {job.status === "completed" && job.results && (
                    <>
                      {" · "}
                      {job.results.processed ?? 0} procesadas,{" "}
                      {job.results.enriched ?? 0} enriquecidas
                    </>
                  )}
                  {job.status === "failed" && job.error_message && (
                    <> · {job.error_message}</>
                  )}
                </p>
              </div>
              {job.status === "completed" && query.downloadEndpoint && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  onClick={() => handleDownload(job)}
                  disabled={downloadingId === job.job_id}
                >
                  <Download className="size-3.5" />
                  {downloadingId === job.job_id ? "..." : "Descargar"}
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
