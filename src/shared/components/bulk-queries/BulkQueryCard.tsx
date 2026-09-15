"use client";

import { useEffect, useRef, useState } from "react";
import * as LucideIcons from "lucide-react";
import { AlertCircle, CheckCircle2, Download, FileSearch, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FileForm } from "@/shared/components/FileForm";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { errorToast } from "@/core/core.function";
import {
  BulkQueryConfig,
  BulkQueryJobStatusResponse,
  BulkQueryResultBase,
} from "@/shared/lib/bulk-queries/bulkQueries.interface";
import {
  downloadBulkQueryFile,
  enqueueBulkQuery,
  getBulkQueryJobStatus,
  previewBulkQuery,
  processBulkQuery,
} from "@/shared/lib/bulk-queries/bulkQueries.actions";
import { BulkQueryJobsList } from "./BulkQueryJobsList";

interface BulkQueryCardProps {
  query: BulkQueryConfig;
}

interface FormValues {
  file: File | null;
}

type Stage = "select" | "preview" | "queued" | "result";

export function BulkQueryCard({ query }: BulkQueryCardProps) {
  const isAsync = query.mode === "async";
  const hasHistory = isAsync && !!query.listJobsEndpoint;

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stage, setStage] = useState<Stage>("select");
  const [previewResult, setPreviewResult] = useState<BulkQueryResultBase | null>(null);
  const [finalResult, setFinalResult] = useState<BulkQueryResultBase | null>(null);
  const [jobStatus, setJobStatus] = useState<BulkQueryJobStatusResponse["data"] | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [historyRefreshSignal, setHistoryRefreshSignal] = useState(0);

  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const form = useForm<FormValues>({ defaultValues: { file: null } });

  const IconComponent = query.icon
    ? (LucideIcons as any)[query.icon] || FileSearch
    : FileSearch;

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  useEffect(() => stopPolling, []);

  const resetUploadState = () => {
    form.reset();
    setPreviewResult(null);
    setFinalResult(null);
    setJobStatus(null);
    setStage("select");
  };

  const handleClose = () => {
    stopPolling();
    resetUploadState();
    setIsSheetOpen(false);
  };

  const handlePreview = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Selecciona un archivo para continuar");
      return;
    }
    setIsLoading(true);
    try {
      const res = await previewBulkQuery(query, values.file);
      setPreviewResult(res);
      setStage("preview");
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "Error al previsualizar el archivo");
    } finally {
      setIsLoading(false);
    }
  };

  const pollJobStatus = (jobId: string | number) => {
    stopPolling();
    pollingRef.current = setInterval(async () => {
      try {
        const res = await getBulkQueryJobStatus(query, jobId);
        setJobStatus(res.data);
        if (res.data.status === "completed" || res.data.status === "failed") {
          stopPolling();
          setStage("result");
        }
      } catch (error: any) {
        stopPolling();
        errorToast(error?.response?.data?.message || "Error al consultar el estado del proceso");
        setStage("result");
      }
    }, query.pollingIntervalMs ?? 5000);
  };

  const handleEnqueue = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Selecciona un archivo para continuar");
      return;
    }
    setIsLoading(true);
    try {
      const res = await enqueueBulkQuery(query, values.file);
      setHistoryRefreshSignal((n) => n + 1);
      if (hasHistory) {
        // El historial se encarga de mostrar el progreso y la descarga;
        // solo limpiamos el formulario para permitir una nueva carga.
        resetUploadState();
      } else {
        setJobStatus(res.data);
        setStage("queued");
        pollJobStatus(res.data.job_id);
      }
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "Error al encolar el archivo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProcess = async () => {
    const file = form.getValues("file");
    if (!file) return;
    setIsLoading(true);
    try {
      const res = await processBulkQuery(query, file);
      setFinalResult(res);
      setStage("result");
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "Error al procesar el archivo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectSubmit = async (values: FormValues) => {
    if (!values.file) {
      errorToast("Selecciona un archivo para continuar");
      return;
    }
    setIsLoading(true);
    try {
      const res = await processBulkQuery(query, values.file);
      setFinalResult(res);
      setStage("result");
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "Error al procesar el archivo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!jobStatus) return;
    setIsDownloading(true);
    try {
      const blob = await downloadBulkQueryFile(query, jobStatus.job_id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = jobStatus.original_filename
        ? `enriquecido_${jobStatus.original_filename}`
        : "archivo_procesado.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      errorToast(error?.response?.data?.message || "Error al descargar el archivo");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderResultSummary = (result: BulkQueryResultBase) => (
    <div
      className={`flex items-start gap-3 rounded-lg p-3 ${
        result.success ? "bg-green-50 text-green-800" : "bg-amber-50 text-amber-800"
      }`}
    >
      {result.success ? (
        <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
      ) : (
        <AlertCircle className="mt-0.5 size-5 shrink-0" />
      )}
      <p className="text-sm font-medium">{result.message}</p>
    </div>
  );

  const renderJobResults = (data: BulkQueryJobStatusResponse["data"]) => {
    const results = data.results;
    if (!results) return null;
    return (
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-lg font-semibold">{results.processed ?? "-"}</p>
          <p className="text-xs text-muted-foreground">Procesados</p>
        </div>
        <div className="rounded-lg bg-green-50 p-3">
          <p className="text-lg font-semibold text-green-700">{results.enriched ?? "-"}</p>
          <p className="text-xs text-muted-foreground">Enriquecidos</p>
        </div>
        <div className="rounded-lg bg-amber-50 p-3">
          <p className="text-lg font-semibold text-amber-700">{results.not_found ?? "-"}</p>
          <p className="text-xs text-muted-foreground">No encontrados</p>
        </div>
      </div>
    );
  };

  const renderUploadForm = () => (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          isAsync
            ? handleEnqueue
            : query.previewEndpoint
              ? handlePreview
              : handleDirectSubmit
        )}
        className="space-y-4"
      >
        <p className="text-sm text-muted-foreground">
          {query.helpText ??
            `Sube el archivo Excel (${query.accept ?? ".xlsx, .xls"}) para continuar.`}
        </p>
        <FormField
          control={form.control}
          name="file"
          render={({ field: { onChange, value } }) => (
            <FileForm
              label="Archivo Excel"
              accept={query.accept ?? ".xlsx,.xls"}
              multiple={false}
              value={value}
              onChange={onChange}
              disabled={isLoading}
            />
          )}
        />
        <div className="flex justify-end gap-2">
          {!hasHistory && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button type="submit" size="sm" disabled={isLoading || !form.watch("file")}>
            {isLoading
              ? "Enviando..."
              : isAsync
                ? "Subir y Procesar"
                : query.previewEndpoint
                  ? "Previsualizar"
                  : "Procesar"}
          </Button>
        </div>
      </form>
    </Form>
  );

  // Modo async con historial: el formulario de carga y la lista de archivos
  // conviven en el mismo sheet (igual al UI de "Mis Archivos Procesados").
  if (hasHistory) {
    return (
      <>
        <Card>
          <CardHeader className="flex justify-between items-start gap-3 w-full">
            <div className="p-3 rounded-md bg-primary/10 shrink-0">
              <IconComponent className="h-7 w-7 text-primary" />
            </div>
          </CardHeader>
          <CardContent className="flex flex-col items-start gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold leading-tight">{query.title}</h3>
              <p className="text-sm text-muted-foreground mt-2">{query.description}</p>
            </div>
            <div className="flex justify-end w-full">
              <Button
                variant="default"
                color="muted"
                size="default"
                className="w-fit"
                onClick={() => setIsSheetOpen(true)}
              >
                Cargar Archivo
              </Button>
            </div>
          </CardContent>
        </Card>

        <GeneralSheet
          open={isSheetOpen}
          onClose={handleClose}
          title={query.title}
          subtitle={query.description}
          icon={query.icon as keyof typeof LucideIcons}
          size="3xl"
        >
          <div className="space-y-6">
            {renderUploadForm()}
            <div className="border-t pt-4">
              <BulkQueryJobsList query={query} refreshSignal={historyRefreshSignal} />
            </div>
          </div>
        </GeneralSheet>
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex justify-between items-start gap-3 w-full">
          <div className="p-3 rounded-md bg-primary/10 shrink-0">
            <IconComponent className="h-7 w-7 text-primary" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold leading-tight">{query.title}</h3>
            <p className="text-sm text-muted-foreground mt-2">{query.description}</p>
          </div>
          <div className="flex justify-end w-full">
            <Button
              variant="default"
              color="muted"
              size="default"
              className="w-fit"
              onClick={() => setIsSheetOpen(true)}
            >
              Cargar Archivo
            </Button>
          </div>
        </CardContent>
      </Card>

      <GeneralSheet
        open={isSheetOpen}
        onClose={handleClose}
        title={query.title}
        subtitle={query.description}
        icon={query.icon as keyof typeof LucideIcons}
        size="3xl"
      >
        {stage === "result" && isAsync && jobStatus ? (
          <div className="space-y-4">
            {jobStatus.status === "completed" ? (
              <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3 text-green-800">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
                <p className="text-sm font-medium">
                  El archivo se procesó correctamente.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 text-red-800">
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <p className="text-sm font-medium">
                  {jobStatus.error_message || "El procesamiento falló."}
                </p>
              </div>
            )}
            {jobStatus.status === "completed" && renderJobResults(jobStatus)}
            <div className="flex justify-between gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={resetUploadState}>
                Nueva carga
              </Button>
              {jobStatus.status === "completed" && query.downloadEndpoint ? (
                <Button size="sm" onClick={handleDownload} disabled={isDownloading}>
                  <Download className="mr-1.5 size-4" />
                  {isDownloading ? "Descargando..." : "Descargar archivo"}
                </Button>
              ) : (
                <Button size="sm" onClick={handleClose}>
                  Cerrar
                </Button>
              )}
            </div>
          </div>
        ) : stage === "queued" && isAsync && jobStatus ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center gap-3 rounded-lg bg-muted p-8 text-center">
              <Loader2 className="size-8 animate-spin text-primary" />
              <div>
                <p className="text-sm font-medium">
                  {jobStatus.status === "processing"
                    ? "Procesando archivo..."
                    : "Archivo en cola, esperando procesamiento..."}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Esto puede tardar varios minutos. Puedes cerrar esta ventana, el
                  proceso continúa en segundo plano.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setIsSheetOpen(false)}>
                Cerrar y seguir esperando
              </Button>
            </div>
          </div>
        ) : stage === "result" && finalResult ? (
          <div className="space-y-4">
            {renderResultSummary(finalResult)}
            <div className="flex justify-between gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={resetUploadState}>
                Nueva carga
              </Button>
              <Button size="sm" onClick={handleClose}>
                Cerrar
              </Button>
            </div>
          </div>
        ) : stage === "preview" && previewResult ? (
          <div className="space-y-4">
            {renderResultSummary(previewResult)}
            <div className="flex justify-between gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setPreviewResult(null);
                  setStage("select");
                }}
                disabled={isLoading}
              >
                Elegir otro archivo
              </Button>
              <Button size="sm" onClick={handleProcess} disabled={isLoading}>
                {isLoading ? "Procesando..." : "Confirmar y Procesar"}
              </Button>
            </div>
          </div>
        ) : (
          renderUploadForm()
        )}
      </GeneralSheet>
    </>
  );
}
