import { useRef, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, Camera, X, FileText, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { compressImageFiles } from "@/shared/lib/image";

export interface UploadedFile {
  id: string;
  file: File;
  previewUrl: string;
  description?: string; // Descripción opcional para cada archivo
}

interface MultipleFileUploadWithCameraProps {
  label?: string;
  accept?: string;
  value?: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  disabled?: boolean;
  className?: string;
  showPreview?: boolean;
  showFileInfo?: boolean;
  maxFiles?: number; // Máximo número de archivos permitidos
  maxSize?: number; // Tamaño máximo por archivo en MB (default: 5MB)
}

// Cache para URLs de objetos para evitar recrearlas en cada render
const objectUrlCache = new WeakMap<File, string>();

export function MultipleFileUploadWithCamera({
  label = "Archivos",
  accept = "image/*,application/pdf",
  value = [],
  onChange,
  disabled = false,
  className = "",
  showPreview = true,
  showFileInfo = true,
  maxFiles = 5,
  maxSize = 5,
}: MultipleFileUploadWithCameraProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Detectar si hay cámara disponible
  const hasCameraAvailable = useMemo(() => {
    if (typeof window === "undefined" || typeof navigator === "undefined")
      return false;

    // Verificar si existe la API de MediaDevices
    const hasMediaDevices = !!(
      navigator.mediaDevices && navigator.mediaDevices.getUserMedia
    );

    if (!hasMediaDevices) return false;

    // Verificar si es un dispositivo móvil con cámara
    const userAgent = navigator.userAgent || "";
    const isMobileDevice =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase(),
      );

    // Solo mostrar opción de cámara en dispositivos móviles
    return isMobileDevice;
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    const fileList = files ? Array.from(files) : [];
    // Limpiar el input antes del await: el SyntheticEvent se recicla tras ceder el hilo
    e.target.value = "";
    if (fileList.length === 0) return;

    setError("");

    // Verificar si se excede el límite de archivos
    if (value.length + fileList.length > maxFiles) {
      setError(`Solo puedes subir un máximo de ${maxFiles} archivos`);
      return;
    }

    setIsProcessing(true);
    try {
      // Comprimir el lote en paralelo antes de validar el tamaño
      const compressedFiles = await compressImageFiles(fileList);

      const newFiles: UploadedFile[] = [];
      let sizeErrorMessage = "";

      compressedFiles.forEach((file, i) => {
        // Verificar tamaño del archivo ya comprimido
        const fileSizeMB = file.size / 1024 / 1024;
        if (fileSizeMB > maxSize) {
          sizeErrorMessage = `El archivo "${file.name}" excede el tamaño máximo de ${maxSize}MB`;
          return;
        }

        // Crear preview URL
        let previewUrl = objectUrlCache.get(file);
        if (!previewUrl) {
          previewUrl = URL.createObjectURL(file);
          objectUrlCache.set(file, previewUrl);
        }

        // Agregar archivo a la lista
        newFiles.push({
          id: `${Date.now()}-${i}`,
          file,
          previewUrl,
        });
      });

      if (sizeErrorMessage) {
        setError(sizeErrorMessage);
      }

      // Actualizar la lista de archivos
      if (newFiles.length > 0) {
        onChange([...value, ...newFiles]);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemoveFile = (id: string) => {
    const updatedFiles = value.filter((f) => f.id !== id);
    onChange(updatedFiles);
    setError("");
  };

  const handleDescriptionChange = (id: string, description: string) => {
    const updatedFiles = value.map((f) =>
      f.id === id ? { ...f, description } : f
    );
    onChange(updatedFiles);
  };

  const handleUploadClick = () => {
    if (isProcessing) return;
    if (value.length >= maxFiles) {
      setError(`Ya has alcanzado el límite de ${maxFiles} archivos`);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleCameraClick = () => {
    if (isProcessing) return;
    if (value.length >= maxFiles) {
      setError(`Ya has alcanzado el límite de ${maxFiles} archivos`);
      return;
    }
    cameraInputRef.current?.click();
  };

  const isPdfFile = (file: File) => {
    return file.type === "application/pdf";
  };

  const canAddMore = value.length < maxFiles;

  return (
    <div className={className}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <Label>{label}</Label>
          <span className="text-sm text-muted-foreground">
            {value.length} / {maxFiles}
          </span>
        </div>
      )}

      {/* Mensaje de error */}
      {error && (
        <div className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-sm text-destructive">
          {error}
        </div>
      )}

      {isProcessing && (
        <div className="mb-2 p-2 bg-muted rounded text-sm text-muted-foreground">
          Comprimiendo imágenes...
        </div>
      )}

      <div className="space-y-2">
        {/* Lista de archivos subidos como items */}
        {value.length > 0 && (
          <div className="space-y-3">
            {value.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="p-3 bg-muted rounded-md space-y-2"
              >
                <div className="flex items-center gap-2">
                  {isPdfFile(uploadedFile.file) ? (
                    <FileText className="h-8 w-8 shrink-0 text-primary" />
                  ) : showPreview ? (
                    <img
                      src={uploadedFile.previewUrl}
                      alt="Vista previa"
                      className="h-12 w-12 object-cover rounded shrink-0"
                    />
                  ) : (
                    <FileText className="h-8 w-8 shrink-0 text-primary" />
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {uploadedFile.file.name}
                    </p>
                    {showFileInfo && (
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleRemoveFile(uploadedFile.id)}
                    disabled={disabled || isProcessing}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Campo de descripción */}
                <div className="space-y-1">
                  <Label className="text-xs">Descripción</Label>
                  <Textarea
                    placeholder="Ej: Transferencia del 50% del monto total"
                    value={uploadedFile.description || ""}
                    onChange={(e) =>
                      handleDescriptionChange(uploadedFile.id, e.target.value)
                    }
                    disabled={disabled || isProcessing}
                    rows={2}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón para agregar más archivos */}
        {canAddMore && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
              disabled={disabled || isProcessing}
              multiple
            />

            {hasCameraAvailable && (
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileChange}
                disabled={disabled || isProcessing}
              />
            )}

            {hasCameraAvailable ? (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleUploadClick}
                  disabled={disabled || isProcessing}
                  className="h-24 border-2 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    {value.length === 0 ? (
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    ) : (
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className="text-sm font-medium">
                      {value.length === 0 ? "Subir" : "Agregar"}
                    </span>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCameraClick}
                  disabled={disabled || isProcessing}
                  className="h-24 border-2 border-dashed"
                >
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="h-6 w-6 text-muted-foreground" />
                    <span className="text-sm font-medium">Cámara</span>
                  </div>
                </Button>
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadClick}
                disabled={disabled || isProcessing}
                className="w-full h-24 border-2 border-dashed"
              >
                <div className="flex flex-col items-center gap-2">
                  {value.length === 0 ? (
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  ) : (
                    <Plus className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">
                    {value.length === 0 ? "Subir Archivos" : "Agregar más"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    JPG, PNG o PDF (máx. {maxSize}MB)
                  </span>
                </div>
              </Button>
            )}
          </>
        )}

        {/* Mensaje cuando se alcanza el límite */}
        {!canAddMore && value.length > 0 && (
          <div className="p-2 bg-muted rounded text-sm text-center text-muted-foreground">
            Límite alcanzado ({maxFiles} archivos)
          </div>
        )}
      </div>
    </div>
  );
}
