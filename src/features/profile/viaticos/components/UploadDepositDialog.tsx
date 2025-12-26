import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadDepositFile } from "../lib/perDiemRequest.actions";
import { toast } from "sonner";
import { PER_DIEM_REQUEST } from "../lib/perDiemRequest.constants";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";

interface UploadDepositDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: PerDiemRequestResource;
}

export function UploadDepositDialog({
  open,
  onOpenChange,
  request,
}: UploadDepositDialogProps) {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const queryClient = useQueryClient();

  // Mutation para subir el archivo
  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadDepositFile(request.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      toast.success("Archivo de depósito subido correctamente");
      handleClose();
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

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setSelectedFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Subir Archivo de Depósito</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Solicitud: <span className="font-semibold">{request.code}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Empleado:{" "}
              <span className="font-semibold">
                {request.employee.full_name}
              </span>
            </p>
          </div>

          <FileUploadWithCamera
            label="Archivo de Depósito"
            accept="image/*,application/pdf"
            value={selectedFile}
            previewUrl={previewUrl}
            onChange={handleFileChange}
            disabled={uploadMutation.isPending}
            showPreview={true}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={uploadMutation.isPending}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!selectedFile || uploadMutation.isPending}
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
