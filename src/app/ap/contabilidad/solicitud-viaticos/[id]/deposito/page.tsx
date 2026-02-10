"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Loader2,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Banknote,
} from "lucide-react";
import { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import TitleComponent from "@/shared/components/TitleComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import BackButton from "@/shared/components/BackButton";
import {
  MultipleFileUploadWithCamera,
  type UploadedFile,
} from "@/shared/components/MultipleFileUploadWithCamera";
import {
  findPerDiemRequestById,
  uploadDepositFiles,
} from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import {
  PER_DIEM_REQUEST,
  PER_DIEM_REQUEST_AP,
} from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import { errorToast, successToast } from "@/core/core.function";

export default function UploadDepositPage() {
  const { ABSOLUTE_ROUTE } = PER_DIEM_REQUEST_AP;
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<{
    url: string;
    label: string;
    mimeType?: string;
  } | null>(null);
  const isMobile = useIsMobile();

  const getFileExtension = (path: string) => {
    return path.split(".").pop()?.toLowerCase();
  };

  const isPDF = (mimeType?: string, path?: string) => {
    if (mimeType) {
      return mimeType === "application/pdf";
    }
    return path ? getFileExtension(path) === "pdf" : false;
  };

  const isImage = (mimeType?: string, path?: string) => {
    if (mimeType) {
      return mimeType.startsWith("image/");
    }
    const ext = path ? getFileExtension(path) : "";
    return ["jpg", "jpeg", "png", "gif", "webp"].includes(ext || "");
  };

  const handleVoucherClick = (
    url: string,
    label: string,
    mimeType?: string,
  ) => {
    if (isMobile) {
      // En móvil: abrir directamente en nueva pestaña
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // En escritorio: abrir modal
      setSelectedVoucher({ url, label, mimeType });
    }
  };

  const { data: request, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: ({
      files,
      descriptions,
    }: {
      files: File[];
      descriptions: string[];
    }) => uploadDepositFiles(Number(id), files, descriptions),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      successToast(
        selectedFiles.length === 1
          ? "Archivo de depósito subido correctamente"
          : "Archivos de depósito subidos correctamente",
      );
      navigate(ABSOLUTE_ROUTE);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ||
          "Error al subir los archivos de depósito",
      );
    },
  });

  const handleFilesChange = (files: UploadedFile[]) => {
    setSelectedFiles(files);
  };

  const handleSave = () => {
    if (selectedFiles.length > 0) {
      // Extraer los archivos y descripciones del arreglo de UploadedFile
      const files = selectedFiles.map((uploadedFile) => uploadedFile.file);
      const descriptions = selectedFiles.map(
        (uploadedFile) => uploadedFile.description || "",
      );
      uploadMutation.mutate({ files, descriptions });
    }
  };

  const handleCancel = () => {
    // Limpiar URLs de objetos
    selectedFiles.forEach((file) => {
      URL.revokeObjectURL(file.previewUrl);
    });
    navigate(ABSOLUTE_ROUTE);
  };

  // Calcular cuántos archivos se pueden subir aún
  const existingFilesCount = request?.deposit_vouchers?.length || 0;
  const remainingSlots = Math.max(0, 3 - existingFilesCount);
  const canUploadMore = remainingSlots > 0;

  if (isLoading) {
    return (
      <FormWrapper>
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md" />
          <Skeleton className="h-96 w-full" />
        </div>
      </FormWrapper>
    );
  }

  if (!request) {
    return (
      <FormWrapper>
        <div className="text-center py-12">
          <p className="text-muted-foreground">Solicitud no encontrada</p>
        </div>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <BackButton route={ABSOLUTE_ROUTE} size="icon" name="" />
          <TitleComponent
            title={
              existingFilesCount > 0
                ? "Subir Archivos Adicionales"
                : "Subir Archivo de Depósito"
            }
            subtitle={`Solicitud: ${request.code}`}
            icon="Upload"
          />
        </div>

        {/* Información de la solicitud */}
        <FormWrapper>
          <div className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Solicitud</p>
                <p className="font-semibold">{request.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Empleado</p>
                <p className="font-semibold">{request.employee.full_name}</p>
              </div>
            </div>
          </div>
        </FormWrapper>

        {/* Archivos ya subidos */}
        {request.deposit_vouchers && request.deposit_vouchers.length > 0 && (
          <FormWrapper>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <h3 className="text-sm font-semibold">
                  Archivos ya subidos ({request.deposit_vouchers.length}/3)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {request.deposit_vouchers.map((voucher, index) => {
                  const isPDFFile = voucher.mimeType === "application/pdf";
                  const isImageFile = voucher.mimeType?.startsWith("image/");

                  return (
                    <Card key={voucher.id} className="p-3">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 ">
                          {isPDFFile ? (
                            <FileText className="h-5 w-5 text-primary" />
                          ) : isImageFile ? (
                            <ImageIcon className="h-5 w-5 text-primary" />
                          ) : (
                            <FileText className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {voucher.description || `Comprobante ${index + 1}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {isPDFFile
                              ? "Documento PDF"
                              : isImageFile
                                ? "Imagen"
                                : "Archivo"}
                          </p>
                          <Badge
                            variant="outline"
                            className="mt-1 text-xs border-primary text-primary"
                          >
                            Subido
                          </Badge>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleVoucherClick(
                            voucher.url,
                            voucher.description || `Comprobante ${index + 1}`,
                            voucher.mimeType,
                          )
                        }
                      >
                        <Banknote className="h-4 w-4 mr-2" />
                        Ver Comprobante
                      </Button>
                    </Card>
                  );
                })}
              </div>

              {request.deposit_vouchers.length >= 3 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-xs text-amber-700 ">
                    Has alcanzado el límite máximo de 3 archivos. Si necesitas
                    cambiar alguno, contacta con soporte.
                  </p>
                </div>
              )}
            </div>
          </FormWrapper>
        )}

        {/* Upload de archivos */}
        {canUploadMore ? (
          <FormWrapper>
            <div className="space-y-4">
              <MultipleFileUploadWithCamera
                label={`Archivos de Depósito * (${remainingSlots} ${remainingSlots === 1 ? "archivo restante" : "archivos restantes"})`}
                accept="image/*,application/pdf"
                value={selectedFiles}
                onChange={handleFilesChange}
                disabled={uploadMutation.isPending}
                showPreview={true}
                showFileInfo={true}
                maxFiles={remainingSlots}
                maxSize={5}
              />

              <p className="text-xs text-muted-foreground">
                Sube los comprobantes de depósito en formato PDF o imagen.
                Puedes subir hasta {remainingSlots}{" "}
                {remainingSlots === 1 ? "archivo" : "archivos"} más (5MB cada
                uno).
              </p>
            </div>
          </FormWrapper>
        ) : (
          <FormWrapper>
            <div className="p-6 text-center bg-muted/50 rounded-lg border-2 border-dashed">
              <CheckCircle2 className="h-12 w-12 mx-auto text-primary mb-3" />
              <p className="text-sm font-semibold mb-1">
                Todos los archivos han sido subidos
              </p>
              <p className="text-xs text-muted-foreground">
                Ya has subido el máximo de 3 archivos permitidos.
              </p>
            </div>
          </FormWrapper>
        )}

        {/* Botones de acción */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
            disabled={uploadMutation.isPending}
          >
            {canUploadMore ? "Cancelar" : "Volver"}
          </Button>

          {canUploadMore && (
            <Button
              type="button"
              onClick={handleSave}
              disabled={selectedFiles.length === 0 || uploadMutation.isPending}
              className="w-full sm:w-auto"
            >
              {uploadMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Modal para vista previa en escritorio */}
      <Dialog
        open={!!selectedVoucher}
        onOpenChange={(open) => !open && setSelectedVoucher(null)}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{selectedVoucher?.label}</DialogTitle>
          </DialogHeader>
          {selectedVoucher && (
            <div className="space-y-4">
              {isPDF(selectedVoucher.mimeType, selectedVoucher.url) ? (
                <div className="space-y-2">
                  <embed
                    src={selectedVoucher.url}
                    type="application/pdf"
                    className="w-full h-[600px] rounded-md"
                  />
                  <a
                    href={selectedVoucher.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <Banknote className="h-4 w-4" />
                    Abrir PDF en nueva pestaña
                  </a>
                </div>
              ) : isImage(selectedVoucher.mimeType, selectedVoucher.url) ? (
                <div className="space-y-2">
                  <img
                    src={selectedVoucher.url}
                    alt={selectedVoucher.label}
                    className="w-full h-auto rounded-md"
                  />
                  <a
                    href={selectedVoucher.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-2"
                  >
                    <ImageIcon className="h-4 w-4" />
                    Abrir imagen en nueva pestaña
                  </a>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Banknote className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Formato de archivo no soportado para vista previa
                  </p>
                  <a
                    href={selectedVoucher.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline mt-2 inline-block"
                  >
                    Descargar archivo
                  </a>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </FormWrapper>
  );
}
