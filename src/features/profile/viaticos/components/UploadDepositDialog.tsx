import { useState, useRef, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Upload, Camera, X, Loader2 } from "lucide-react";
import { PerDiemRequestResource } from "../lib/perDiemRequest.interface";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadDepositFile } from "../lib/perDiemRequest.actions";
import { toast } from "sonner";
import { PER_DIEM_REQUEST } from "../lib/perDiemRequest.constants";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  // Detectar si es dispositivo móvil con cámara
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return false;
    const userAgent = navigator.userAgent || "";
    const mobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
    const hasMediaDevices = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );
    return mobile && hasMediaDevices;
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Crear previsualización local
      const localPreviewUrl = URL.createObjectURL(file);
      setPreviewUrl(localPreviewUrl);
      setSelectedFile(file);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleClose = () => {
    handleRemoveFile();
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

          <div>
            <Label>Archivo de Depósito</Label>
            <div className="mt-2">
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Vista previa del depósito"
                    className="w-full h-64 object-contain rounded border-2 border-gray-200 bg-gray-50"
                  />
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2"
                    onClick={handleRemoveFile}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              ) : (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,application/pdf"
                    capture={isMobile ? "environment" : undefined}
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-32 border-2 border-dashed"
                  >
                    <div className="flex flex-col items-center gap-2">
                      {isMobile ? (
                        <>
                          <Camera className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Tomar Foto
                          </span>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            Subir Archivo
                          </span>
                        </>
                      )}
                      <span className="text-xs text-muted-foreground">
                        JPG, PNG o PDF
                      </span>
                    </div>
                  </Button>
                </>
              )}
            </div>
          </div>
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
