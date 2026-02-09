"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
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

  const { data: request, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => uploadDepositFiles(Number(id), files),
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
      // Extraer solo los archivos del arreglo de UploadedFile
      const files = selectedFiles.map((uploadedFile) => uploadedFile.file);
      uploadMutation.mutate(files);
    }
  };

  const handleCancel = () => {
    // Limpiar URLs de objetos
    selectedFiles.forEach((file) => {
      URL.revokeObjectURL(file.previewUrl);
    });
    navigate(ABSOLUTE_ROUTE);
  };

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
            title="Subir Archivo de Depósito"
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

        {/* Upload de archivos */}
        <FormWrapper>
          <div className="space-y-4">
            <MultipleFileUploadWithCamera
              label="Archivos de Depósito *"
              accept="image/*,application/pdf"
              value={selectedFiles}
              onChange={handleFilesChange}
              disabled={uploadMutation.isPending}
              showPreview={true}
              showFileInfo={true}
              maxFiles={3}
              maxSize={5}
            />

            <p className="text-xs text-muted-foreground">
              Sube los comprobantes de depósito en formato PDF o imagen. Máximo
              3 archivos de 5MB cada uno.
            </p>
          </div>
        </FormWrapper>

        {/* Botones de acción */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:justify-end pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-full sm:w-auto"
            disabled={uploadMutation.isPending}
          >
            Cancelar
          </Button>

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
        </div>
      </div>
    </FormWrapper>
  );
}
