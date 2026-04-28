"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUploadWithCamera } from "@/shared/components/FileUploadWithCamera";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { useUploadSignedKycDeclaration } from "../lib/declaracionJuradaKyc.hook";
import { CustomerKycDeclarationResource } from "../lib/declaracionJuradaKyc.interface";
import { errorToast } from "@/core/core.function";

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
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Subir PDF Firmado"
      subtitle={`${declaration.full_name} — DJ #${declaration.id}`}
      size="xl"
      icon="Upload"
      childrenFooter={
        <div className="gap-2 flex">
          <Button variant="outline" onClick={handleClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!file || isPending}
            className="gap-1"
          >
            {isPending ? "Subiendo..." : "Subir PDF"}
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Suba el PDF firmado por el cliente. El sistema cambiará el estado a{" "}
          <span className="font-semibold text-green-600">FIRMADO</span>.
        </p>
        <p className="text-xs text-muted-foreground">
          Solo PDF · Máx. {MAX_SIZE_MB} MB. Si ya existe un archivo firmado,
          será reemplazado.
        </p>
        <FileUploadWithCamera
          label="Archivo PDF Firmado"
          accept=".pdf"
          value={file}
          onChange={(f) => setFile(f)}
          disabled={isPending}
          showPreview={true}
          showFileInfo={true}
        />
      </div>
    </GeneralModal>
  );
}
