"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileForm } from "@/shared/components/FileForm";
import { useUploadSignedKycDeclaration } from "../lib/declaracionJuradaKyc.hook";
import { CustomerKycDeclarationResource } from "../lib/declaracionJuradaKyc.interface";
import { errorToast } from "@/core/core.function";
import { Upload } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  declaration: CustomerKycDeclarationResource;
  onSuccess?: () => void;
}

const MAX_SIZE_MB = 10;

export default function UploadSignedPdfModal({
  open,
  onOpenChange,
  declaration,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const { mutate, isPending } = useUploadSignedKycDeclaration();

  const handleSubmit = () => {
    if (!file) {
      errorToast("Seleccione un archivo PDF");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      errorToast(`El archivo no puede superar ${MAX_SIZE_MB} MB`);
      return;
    }
    mutate(
      { id: declaration.id, file },
      {
        onSuccess: () => {
          setFile(null);
          onOpenChange(false);
          onSuccess?.();
        },
      },
    );
  };

  const handleClose = () => {
    if (isPending) return;
    setFile(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full p-2 bg-green-100">
              <Upload className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <DialogTitle>Subir PDF Firmado</DialogTitle>
              <DialogDescription className="text-xs mt-0.5">
                {declaration.full_name} — DJ #{declaration.id}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <p className="text-sm text-muted-foreground">
            Suba el PDF firmado por el cliente. El sistema cambiará el estado a{" "}
            <span className="font-semibold text-green-600">FIRMADO</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            Solo PDF · Máx. {MAX_SIZE_MB} MB. Si ya existe un archivo firmado,
            será reemplazado.
          </p>
          <FileForm
            label="Archivo PDF Firmado"
            accept=".pdf"
            value={file}
            onChange={(f) => setFile(f as File | null)}
            disabled={isPending}
          />
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || isPending}
            className="gap-1"
          >
            <Upload className="size-4" />
            {isPending ? "Subiendo..." : "Subir PDF"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
