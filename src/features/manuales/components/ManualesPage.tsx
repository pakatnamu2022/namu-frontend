import { useState } from "react";
import { BookOpen } from "lucide-react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useManuals } from "../lib/manuales.hook";
import { ManualResource } from "../lib/manuales.interface";
import ManualCard from "./ManualCard";
import ManualViewer from "./ManualViewer";
import TitleComponent from "@/shared/components/TitleComponent";

export default function ManualesPage() {
  const { moduleSlug, currentModule } = useCurrentModule();
  const { data: manuals, isLoading } = useManuals(currentModule?.id ?? 0);
  const [selected, setSelected] = useState<ManualResource | null>(null);

  const moduleName = currentModule?.descripcion ?? moduleSlug;

  return (
    <div className="space-y-6">
      {selected ? (
        <TitleComponent
          title={selected.title}
          icon="BookOpen"
          onBack={() => setSelected(null)}
        />
      ) : (
        <TitleComponent
          title="Manuales"
          subtitle={moduleName}
          icon="BookOpen"
        />
      )}

      {selected ? (
        <ManualViewer id={selected.id} />
      ) : (
        <>
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 rounded-xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          )}

          {!isLoading && (!manuals || manuals.length === 0) && (
            <div className="py-16 text-center text-gray-400">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">
                No hay manuales disponibles para este módulo.
              </p>
            </div>
          )}

          {!isLoading && manuals && manuals.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {manuals.map((manual) => (
                <ManualCard
                  key={manual.id}
                  manual={manual}
                  onClick={setSelected}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
