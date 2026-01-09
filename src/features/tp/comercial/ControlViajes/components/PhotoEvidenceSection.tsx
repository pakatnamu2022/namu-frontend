import { ImageIcon } from "lucide-react";

interface PhotoEvidenceSectionProps {
  startPhoto: string | null;
  endPhoto: string | null;
}

export function PhotoEvidenceSection({
  startPhoto,
  endPhoto,
}: PhotoEvidenceSectionProps) {
  if (!startPhoto && !endPhoto) {
    return null;
  }

  return (
    <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 animate-slide-up">
      <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
        <ImageIcon className="h-4 w-4 text-primary" />
        Evidencia Fotografica
      </h2>
      <div className="grid grid-cols-2 gap-3">
        {startPhoto && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Inicio</p>
            <img
              src={startPhoto}
              alt="Foto de Inicio"
              className="w-full h-24 object-cover rounded-lg border border-success/30"
            />
          </div>
        )}
        {endPhoto && (
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Fin</p>
            <img
              src={endPhoto}
              alt="Foto de fin"
              className="w-full h-24 object-cover rounded-lg border border-destructive/30"
            />
          </div>
        )}
      </div>
    </div>
  );
}
