"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  FileText,
  Paperclip,
  Download,
  Eye,
  Loader2,
  Upload,
  FileUp,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  getWorkOrderDocuments,
  uploadWorkOrderDocuments,
} from "../../lib/workOrder.actions";
import { errorToast, successToast, formatDateTime } from "@/core/core.function";

const MAX_FILES = 3;
const MAX_SIZE_MB = 10;

interface DocumentsTabProps {
  workOrderId: number;
}

export default function DocumentsTab({ workOrderId }: DocumentsTabProps) {
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ["workOrderDocuments", workOrderId],
    queryFn: () => getWorkOrderDocuments(workOrderId),
    enabled: !!workOrderId,
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadWorkOrderDocuments(workOrderId, files),
    onSuccess: () => {
      successToast("Archivo(s) subido(s) exitosamente");
      queryClient.invalidateQueries({
        queryKey: ["workOrderDocuments", workOrderId],
      });
      setSelectedFiles([]);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(msg || "Error al subir el/los archivo(s)");
    },
  });

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    const fileArray = fileList ? Array.from(fileList) : [];
    e.target.value = "";
    if (fileArray.length === 0) return;

    const combined = [...selectedFiles, ...fileArray];

    if (combined.length > MAX_FILES) {
      errorToast(`Solo puedes subir un máximo de ${MAX_FILES} archivos`);
      return;
    }

    const oversized = fileArray.find(
      (f) => f.size / 1024 / 1024 > MAX_SIZE_MB,
    );
    if (oversized) {
      errorToast(
        `El archivo "${oversized.name}" excede el tamaño máximo de ${MAX_SIZE_MB}MB`,
      );
      return;
    }

    const nonPdf = fileArray.find((f) => f.type !== "application/pdf");
    if (nonPdf) {
      errorToast(`El archivo "${nonPdf.name}" no es un PDF`);
      return;
    }

    setSelectedFiles(combined);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = () => {
    if (selectedFiles.length === 0) return;
    uploadMutation.mutate(selectedFiles);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Paperclip className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Adjuntar Archivos</h3>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Archivos PDF (máx. {MAX_FILES}, {MAX_SIZE_MB}MB c/u)
            </Label>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg overflow-hidden"
                  >
                    <FileUp className="h-5 w-5 text-primary shrink-0" />
                    <span className="flex-1 min-w-0 text-sm font-medium truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="h-6 w-6 p-0 shrink-0"
                      disabled={uploadMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {selectedFiles.length < MAX_FILES && (
              <div className="relative">
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  onChange={handleFileInputChange}
                  disabled={uploadMutation.isPending}
                  className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 disabled:opacity-50"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleUpload}
              disabled={selectedFiles.length === 0 || uploadMutation.isPending}
              className="gap-2"
            >
              {uploadMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploadMutation.isPending ? "Subiendo..." : "Subir"}
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
            <p className="text-gray-500">Cargando archivos...</p>
          </div>
        </Card>
      ) : documents.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No hay archivos adjuntos
            </h3>
            <p className="text-sm text-gray-600">
              Aún no se han subido archivos a esta orden de trabajo.
            </p>
          </div>
        </Card>
      ) : (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Archivos Adjuntos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-start gap-3 rounded-md border border-muted bg-muted/20 p-3"
              >
                <FileText className="h-8 w-8 shrink-0 text-primary mt-0.5" />
                <div className="min-w-0 flex-1 leading-tight">
                  <p
                    className="text-sm font-medium truncate"
                    title={doc.name}
                  >
                    {doc.name}
                  </p>
                  {doc.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {doc.description}
                    </p>
                  )}
                  {doc.created_at && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDateTime(doc.created_at)}
                    </p>
                  )}
                  <div className="flex items-center gap-1 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => window.open(doc.url, "_blank")}
                      tooltip="Ver"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = doc.url;
                        link.download = doc.name;
                        link.target = "_blank";
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      }}
                      tooltip="Descargar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
