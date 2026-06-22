import { useState } from "react";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useManuals } from "../lib/manuales.hook";
import { ManualResource } from "../lib/manuales.interface";
import ManualCard from "./ManualCard";
import ManualViewer from "./ManualViewer";

export default function ManualesPage() {
  const { company, moduleSlug, currentModule } = useCurrentModule();
  const { data: manuals, isLoading } = useManuals(company, moduleSlug);
  const [selected, setSelected] = useState<ManualResource | null>(null);

  const moduleName = currentModule?.descripcion ?? moduleSlug;

  if (selected) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelected(null)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a manuales
        </button>
        <ManualViewer s3Url={selected.s3_url} title={selected.title} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <BookOpen className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Manuales</h1>
          <p className="text-sm text-gray-500">{moduleName}</p>
        </div>
      </div>

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
          <p className="text-sm">No hay manuales disponibles para este módulo.</p>
        </div>
      )}

      {!isLoading && manuals && manuals.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {manuals.map((manual) => (
            <ManualCard key={manual.id} manual={manual} onClick={setSelected} />
          ))}
        </div>
      )}
    </div>
  );
}
