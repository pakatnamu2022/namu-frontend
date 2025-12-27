"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import TitleComponent from "@/shared/components/TitleComponent";
import FormWrapper from "@/shared/components/FormWrapper";
import BackButton from "@/shared/components/BackButton";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";
import {
  findPerDiemRequestById,
  uploadDepositFile,
} from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";

export default function UploadDepositPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: request, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDepositFile(Number(id), file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      toast.success("Archivo de depósito subido correctamente");
      navigate(`/gp/gestion-humana/viaticos/solicitud-viaticos`);
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Error al subir el archivo de depósito"
      );
    },
  });

  const handleFileChange = (file: File | null, url: string) => {
    setSelectedFile(file);
    setPreviewUrl(url);
  };

  const handleSave = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    navigate(`/gp/gestion-humana/viaticos/solicitud-viaticos`);
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
          <BackButton
            route={`/gp/gestion-humana/viaticos/solicitud-viaticos`}
            size="icon"
            name=""
          />
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

        {/* Upload de archivo */}
        <FormWrapper>
          <div className="space-y-4">
            <FileUploadWithCamera
              label="Archivo de Depósito *"
              accept="image/*,application/pdf"
              value={selectedFile}
              previewUrl={previewUrl}
              onChange={handleFileChange}
              disabled={uploadMutation.isPending}
              showPreview={true}
              showFileInfo={true}
            />

            <p className="text-xs text-muted-foreground">
              Sube el comprobante de depósito en formato PDF o imagen. Tamaño
              máximo: 5MB.
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
            disabled={!selectedFile || uploadMutation.isPending}
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
