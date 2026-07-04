// Compresión de imágenes en el cliente antes de subirlas al backend.
// Reduce dimensiones/peso usando Canvas API (sin dependencias externas).

export interface CompressImageOptions {
  maxDimension?: number;
  quality?: number;
  skipBelowBytes?: number;
}

export async function compressImageFile(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  const {
    maxDimension = 1920,
    quality = 0.78,
    skipBelowBytes = 800 * 1024,
  } = options;

  if (!file.type.startsWith("image")) return file;
  if (file.size <= skipBelowBytes) return file;

  let objectUrl = "";
  try {
    objectUrl = URL.createObjectURL(file);
    const image = await loadImage(objectUrl);
    const { width, height } = getScaledDimensions(
      image.naturalWidth,
      image.naturalHeight,
      maxDimension,
    );

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx || typeof canvas.toBlob !== "function") return file;
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, file.type, quality),
    );
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], file.name, {
      type: blob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.warn("No se pudo comprimir la imagen, se usará el original:", error);
    return file;
  } finally {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getScaledDimensions(
  width: number,
  height: number,
  maxDimension: number,
): { width: number; height: number } {
  const largerSide = Math.max(width, height);
  if (largerSide <= maxDimension) return { width, height };
  const scale = maxDimension / largerSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

export async function compressImageFiles(
  files: File[],
  options?: CompressImageOptions,
): Promise<File[]> {
  return Promise.all(files.map((f) => compressImageFile(f, options)));
}
