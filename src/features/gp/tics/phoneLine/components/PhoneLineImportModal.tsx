"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FileForm } from "@/shared/components/FileForm";
import { Button } from "@/components/ui/button";
import { importPhoneLines } from "../lib/phoneLine.actions";
import { errorToast, successToast } from "@/core/core.function";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PhoneLineImportModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const [file, setFile] = useState<File | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: importPhoneLines,
    onSuccess: () => {
      successToast("Líneas telefónicas importadas correctamente");
      setFile(null);
      onSuccess();
      onClose();
    },
    onError: () => {
      errorToast("Error al importar las líneas telefónicas");
    },
  });

  const handleImport = () => {
    if (!file) return;
    mutate(file);
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title="Importar líneas telefónicas"
      subtitle="Selecciona un archivo Excel o CSV para importar líneas telefónicas."
    >
      <div className="space-y-4">
        <FileForm
          label="Archivo"
          accept=".xlsx,.xls,.csv"
          multiple={false}
          value={file}
          onChange={(f) => setFile(f as File | null)}
        />
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!file || isPending}>
            {isPending ? "Importando..." : "Importar"}
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
