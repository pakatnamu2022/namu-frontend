import { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { errorToast, successToast } from "@/core/core.function";
import { FamiliesResource } from "../lib/families.interface";
import { uploadFamilyImage } from "../lib/families.actions";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024;

interface Props {
  family: FamiliesResource;
  onClose: () => void;
  onSuccess: () => void;
}

export default function FamilyImageModal({ family, onClose, onSuccess }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(family.image);

  // Libera el object URL de la vista previa al reemplazarla o desmontar
  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const { mutate, isPending } = useMutation({
    mutationFn: (image: File) => uploadFamilyImage(family.id, image),
    onSuccess: () => {
      successToast("Imagen de la familia actualizada correctamente.");
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message ?? "No se pudo subir la imagen.",
      );
    },
  });

  const handleSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!ACCEPTED_TYPES.includes(selected.type)) {
      errorToast("Formatos permitidos: JPG, PNG o WebP.");
      return;
    }
    if (selected.size > MAX_SIZE) {
      errorToast("La imagen no debe superar los 4MB.");
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  };

  return (
    <GeneralModal
      open
      onClose={onClose}
      title="Imagen de la familia"
      subtitle={`${family.brand} · ${family.description}`}
      size="lg"
    >
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-52 w-full flex-col items-center justify-center gap-2 rounded-xl bg-muted/40 transition-colors hover:bg-muted/70"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={family.description}
              className="max-h-44 max-w-full object-contain"
            />
          ) : (
            <>
              <ImagePlus className="size-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Haz clic para elegir una imagen
              </span>
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleSelect}
        />
        <p className="text-xs text-muted-foreground">
          Ideal: render del auto en vista 3/4 con fondo transparente (PNG o
          WebP), máx. 4MB. Se muestra en el Dashboard de Entregas.
        </p>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={!file || isPending}
            onClick={() => file && mutate(file)}
          >
            {isPending && <Loader className="mr-2 size-4 animate-spin" />}
            {isPending ? "Subiendo" : "Guardar imagen"}
          </Button>
        </div>
      </div>
    </GeneralModal>
  );
}
