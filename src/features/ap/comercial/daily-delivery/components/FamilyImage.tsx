import { useState } from "react";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";

interface FamilyImageProps {
  image: string | null;
  brandLogo?: string | null;
  alt: string;
  className?: string;
}

const isUrl = (value?: string | null): value is string =>
  !!value && /^https?:\/\//i.test(value);

/**
 * Imagen de la familia. Si no tiene imagen (o falla al cargar) cae al logo de la
 * marca atenuado y, en última instancia, a un ícono, para que la lista nunca
 * quede con huecos. Algunos logos legacy son rutas relativas: se ignoran.
 */
export default function FamilyImage({
  image,
  brandLogo,
  alt,
  className,
}: FamilyImageProps) {
  const [failed, setFailed] = useState<string[]>([]);
  const markFailed = (src: string) => setFailed((prev) => [...prev, src]);

  if (isUrl(image) && !failed.includes(image)) {
    return (
      <img
        src={image}
        alt={alt}
        loading="lazy"
        draggable={false}
        onError={() => markFailed(image)}
        className={cn("object-contain select-none", className)}
      />
    );
  }

  if (isUrl(brandLogo) && !failed.includes(brandLogo)) {
    return (
      <img
        src={brandLogo}
        alt={alt}
        loading="lazy"
        draggable={false}
        onError={() => markFailed(brandLogo)}
        className={cn(
          "object-contain select-none opacity-30 grayscale",
          className,
        )}
      />
    );
  }

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Car className="h-1/2 w-1/2 text-muted-foreground/40" strokeWidth={1.25} />
    </div>
  );
}
