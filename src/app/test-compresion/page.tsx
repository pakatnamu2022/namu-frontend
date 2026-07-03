"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { compressImageFile } from "@/shared/lib/image";

interface ImageInfo {
  width: number;
  height: number;
}

interface CompressionResult {
  id: string;
  name: string;
  type: string;
  originalSizeBytes: number;
  finalSizeBytes: number;
  originalDimensions?: ImageInfo;
  finalDimensions?: ImageInfo;
  previewUrl: string;
}

function formatBytes(bytes: number) {
  return `${(bytes / 1024).toFixed(0)} KB`;
}

function getImageDimensions(file: File): Promise<ImageInfo | undefined> {
  if (!file.type.startsWith("image")) return Promise.resolve(undefined);
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(undefined);
    };
    img.src = url;
  });
}

// Módulo aislado para verificar, sin enviar nada al backend, exactamente cómo
// queda un archivo (peso, dimensiones, tipo) después de pasar por la misma
// compresión (compressImageFile) que usan FileUploadWithCamera y
// MultipleFileUploadWithCamera antes de subir al servidor.
export default function TestCompresionPage() {
  const [results, setResults] = useState<CompressionResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const analyzeFiles = async (rawFiles: File[]) => {
    setIsProcessing(true);
    try {
      const analyzed = await Promise.all(
        rawFiles.map(async (rawFile, i) => {
          const [originalDimensions, compressedFile] = await Promise.all([
            getImageDimensions(rawFile),
            compressImageFile(rawFile),
          ]);
          const finalDimensions = await getImageDimensions(compressedFile);

          return {
            id: `${Date.now()}-${i}`,
            name: rawFile.name,
            type: rawFile.type,
            originalSizeBytes: rawFile.size,
            finalSizeBytes: compressedFile.size,
            originalDimensions,
            finalDimensions,
            previewUrl: URL.createObjectURL(compressedFile),
          };
        }),
      );
      setResults(analyzed);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = "";
    if (files.length > 0) analyzeFiles(files);
  };

  const totalOriginal = results.reduce((s, r) => s + r.originalSizeBytes, 0);
  const totalFinal = results.reduce((s, r) => s + r.finalSizeBytes, 0);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Prueba de compresión de imágenes</h1>
        <p className="text-sm text-muted-foreground">
          Módulo aislado que ejecuta exactamente la misma compresión que se usa
          antes de subir archivos, para ver el resultado real (peso,
          dimensiones, formato). No envía nada al backend.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analizar archivos</CardTitle>
          <CardDescription>
            Selecciona una o varias imágenes (puedes elegir varias a la vez
            para simular un lote de fotos de cámara).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              id="analyze-input"
              onChange={handleInputChange}
              disabled={isProcessing}
            />
            <Button asChild disabled={isProcessing} variant="outline">
              <label htmlFor="analyze-input" className="cursor-pointer">
                {isProcessing ? "Comprimiendo..." : "Elegir imágenes"}
              </label>
            </Button>
          </div>

          {results.length > 0 && (
            <div className="space-y-3">
              {results.map((r) => (
                <ResultCard key={r.id} result={r} />
              ))}
              <p className="text-sm text-muted-foreground">
                Total: {formatBytes(totalOriginal)} →{" "}
                <strong>{formatBytes(totalFinal)}</strong>
                {totalOriginal > 0 && (
                  <>
                    {" "}
                    (-
                    {Math.round((1 - totalFinal / totalOriginal) * 100)}%)
                  </>
                )}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ResultCard({ result }: { result: CompressionResult }) {
  const reduced =
    result.originalSizeBytes > 0
      ? Math.round(
          (1 - result.finalSizeBytes / result.originalSizeBytes) * 100,
        )
      : 0;

  return (
    <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
      {result.previewUrl && (
        <img
          src={result.previewUrl}
          alt="preview"
          className="h-16 w-16 object-cover rounded shrink-0"
        />
      )}
      <div className="flex-1 min-w-0 space-y-1">
        <p className="text-sm font-medium truncate">{result.name}</p>
        <p className="text-xs text-muted-foreground">{result.type}</p>
        <div className="flex flex-wrap gap-2">
          <Badge color="gray" variant="outline">
            Original: {formatBytes(result.originalSizeBytes)}
            {result.originalDimensions
              ? ` · ${result.originalDimensions.width}×${result.originalDimensions.height}`
              : ""}
          </Badge>
          <Badge color="blue" variant="outline">
            Final: {formatBytes(result.finalSizeBytes)}
            {result.finalDimensions
              ? ` · ${result.finalDimensions.width}×${result.finalDimensions.height}`
              : ""}
          </Badge>
          {reduced > 0 && <Badge color="green">-{reduced}%</Badge>}
        </div>
      </div>
    </div>
  );
}
