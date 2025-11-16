"use client";

import { useState, useRef } from "react";
import { UseFormReturn } from "react-hook-form";
import { Camera, Upload, X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

interface ImageUploadFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label?: string;
  maxSizeInMB?: number;
  acceptedFormats?: string[];
  required?: boolean;
}

/**
 * Componente de carga de imágenes con dos opciones:
 * - Capturar foto (cámara en móvil/webcam en PC)
 * - Subir archivo desde el dispositivo
 *
 * Muestra vista previa de la imagen y permite eliminarla.
 *
 * @example
 * ```tsx
 * <imgUploadField
 *   form={form}
 *   name="file"
 *   label="Foto de la Guía de Remisión"
 *   maxSizeInMB={5}
 *   required={false}
 * />
 * ```
 */
export const ImageUploadField = ({
  form,
  name,
  label = "Imagen",
  maxSizeInMB = 5,
  acceptedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"],
  required = false,
}: ImageUploadFieldProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const captureInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

  const handleFileChange = (
    file: File | null,
    onChange: (file: File | null) => void
  ) => {
    if (!file) {
      setPreview(null);
      onChange(null);
      return;
    }

    // Validar tipo de archivo
    if (!acceptedFormats.includes(file.type)) {
      form.setError(name, {
        type: "manual",
        message: `Formato no válido. Solo se aceptan: ${acceptedFormats.join(
          ", "
        )}`,
      });
      return;
    }

    // Validar tamaño
    if (file.size > maxSizeInBytes) {
      form.setError(name, {
        type: "manual",
        message: `El archivo es muy grande. Máximo ${maxSizeInMB}MB`,
      });
      return;
    }

    // Limpiar errores previos
    form.clearErrors(name);

    // Crear vista previa
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Actualizar el formulario
    onChange(file);
  };

  const handleRemove = (onChange: (file: File | null) => void) => {
    setPreview(null);
    onChange(null);
    form.clearErrors(name);

    // Limpiar los inputs
    if (captureInputRef.current) captureInputRef.current.value = "";
    if (uploadInputRef.current) uploadInputRef.current.value = "";
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field: { onChange, value, ref, ...field } }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </FormLabel>
          <FormControl>
            <div className="space-y-4">
              {/* Botones de acción */}
              {!preview && (
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Botón Capturar Foto */}
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => captureInputRef.current?.click()}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Capturar Foto
                  </Button>
                  <input
                    ref={captureInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange(file, onChange);
                    }}
                    {...field}
                  />

                  {/* Botón Subir Archivo */}
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => uploadInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Subir Archivo
                  </Button>
                  <input
                    ref={uploadInputRef}
                    type="file"
                    accept={acceptedFormats.join(",")}
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      handleFileChange(file, onChange);
                    }}
                    {...field}
                  />
                </div>
              )}

              {/* Vista previa de la imagen */}
              {preview && (
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                  <div className="flex flex-col items-center space-y-3">
                    {/* Imagen */}
                    <div className="relative w-full max-w-md">
                      <img
                        src={preview}
                        alt="Vista previa"
                        className="w-full h-auto rounded-lg shadow-md"
                      />
                    </div>

                    {/* Información del archivo */}
                    {value && (
                      <div className="text-sm text-gray-600 text-center space-y-1">
                        <p className="font-medium flex items-center justify-center gap-2">
                          <imgIcon className="h-4 w-4" />
                          {value.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(value.size)}
                        </p>
                      </div>
                    )}

                    {/* Botón Eliminar */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemove(onChange)}
                      className="mt-2"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Eliminar
                    </Button>
                  </div>
                </div>
              )}

              {/* Información adicional */}
              {!preview && (
                <p className="text-xs text-gray-500">
                  Formatos aceptados: JPG, PNG, WEBP. Tamaño máximo:{" "}
                  {maxSizeInMB}MB
                </p>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
