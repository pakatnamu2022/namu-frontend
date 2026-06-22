import { useState } from "react";
import { BookOpen, ChevronLeft } from "lucide-react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useManuals } from "../lib/manuales.hook";
import { ManualResource } from "../lib/manuales.interface";
import ManualCard from "./ManualCard";
import ManualViewer from "./ManualViewer";

function PageTitle({
  moduleName,
  selected,
  onBack,
}: {
  moduleName: string;
  selected: ManualResource | null;
  onBack: () => void;
}) {
  if (selected) {
    return (
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold text-gray-900 truncate">
          {selected.title}
        </h1>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <BookOpen className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h1 className="text-xl font-bold text-gray-900">Manuales</h1>
        <p className="text-sm text-gray-500">{moduleName}</p>
      </div>
    </div>
  );
}

export default function ManualesPage() {
  const { moduleSlug, currentModule } = useCurrentModule();
  const { data: manuals, isLoading } = useManuals(currentModule?.id ?? 0);
  const [selected, setSelected] = useState<ManualResource | null>(null);

  const moduleName = currentModule?.descripcion ?? moduleSlug;

  return (
    <div className="space-y-6">
      <PageTitle
        moduleName={moduleName}
        selected={selected}
        onBack={() => setSelected(null)}
      />

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
