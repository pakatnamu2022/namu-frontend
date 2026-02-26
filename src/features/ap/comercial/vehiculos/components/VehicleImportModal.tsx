"use client";

import { useRef, useState } from "react";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Loader, Upload, FileSpreadsheet, X } from "lucide-react";
import { matchVins } from "../lib/vehicles.actions";
import { VinMatchResponse } from "../lib/vehicles.interface";
import { errorToast } from "@/core/core.function";

const ACCEPTED_EXTENSIONS = [".xlsx", ".xls", ".csv"];
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

interface VehicleImportModalProps {
  open: boolean;
  onClose: () => void;
  onResult: (result: VinMatchResponse) => void;
}

export default function VehicleImportModal({
  open,
  onClose,
  onResult,
}: VehicleImportModalProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const validateFile = (f: File): string => {
    const ext = "." + f.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(ext)) {
      return `Formato no válido. Se aceptan: ${ACCEPTED_EXTENSIONS.join(", ")}`;
    }
    if (f.size > MAX_SIZE_BYTES) {
      return `El archivo no debe superar ${MAX_SIZE_MB} MB`;
    }
    return "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null;
    if (!selected) return;
    const error = validateFile(selected);
    setFileError(error);
    setFile(error ? null : selected);
  };

  const handleRemove = () => {
    setFile(null);
    setFileError("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    handleRemove();
    onClose();
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsLoading(true);
    try {
      const result = await matchVins(file);
      handleClose();
      onResult(result);
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.errors?.file?.[0] ||
        "Error al procesar el archivo";
      errorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Importar VINs"
      icon="Upload"
      subtitle="Sube un archivo Excel o CSV con los VINs a comparar"
      size="md"
    >
      <div className="space-y-4 py-2">
        {/* Drop zone / file picker */}
        <div
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
        >
          <FileSpreadsheet className="size-10 text-muted-foreground" />
          <div className="text-center">
            <p className="text-sm font-medium">
              Haz clic para seleccionar un archivo
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Formatos aceptados: .xlsx, .xls, .csv — Máx. {MAX_SIZE_MB} MB
            </p>
          </div>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
          />
        </div>

        {/* Selected file */}
        {file && (
          <div className="flex items-center gap-2 rounded-md border px-3 py-2 bg-muted/40">
            <FileSpreadsheet className="size-4 text-primary shrink-0" />
            <span className="text-sm truncate flex-1">{file.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <button
              type="button"
              onClick={handleRemove}
              className="text-muted-foreground hover:text-destructive shrink-0"
            >
              <X className="size-4" />
            </button>
          </div>
        )}

        {/* Validation error */}
        {fileError && (
          <p className="text-xs text-destructive">{fileError}</p>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!file || !!fileError || isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 size-4 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <Upload className="mr-2 size-4" />
                Importar
              </>
            )}
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
