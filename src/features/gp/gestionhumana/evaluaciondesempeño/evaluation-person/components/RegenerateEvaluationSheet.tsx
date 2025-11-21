"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { Option } from "@/core/core.interface";

interface RegenerateEvaluationParams {
  mode: "full_reset" | "sync_with_cycle" | "add_missing_only";
  reset_progress?: boolean;
  force?: boolean;
}

interface Props {
  onRegenerate: (params: RegenerateEvaluationParams) => void;
  loadingRegenerate: boolean;
}

const modeOptions: Option[] = [
  {
    value: "full_reset",
    label: "Reinicio completo",
    description: "Elimina todos los datos y regenera desde cero",
  },
  {
    value: "sync_with_cycle",
    label: "Sincronizar con ciclo",
    description: "Sincroniza con el ciclo de evaluación actual",
  },
  {
    value: "add_missing_only",
    label: "Agregar solo faltantes",
    description: "Solo agrega elementos que faltan",
  },
];

export default function RegenerateEvaluationSheet({
  onRegenerate,
  loadingRegenerate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<string>("add_missing_only");
  const [resetProgress, setResetProgress] = useState(false);
  const [force, setForce] = useState(false);

  const handleRegenerate = () => {
    onRegenerate({
      mode: mode as RegenerateEvaluationParams["mode"],
      reset_progress: resetProgress,
      force,
    });
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="w-full md:w-auto"
          disabled={loadingRegenerate}
        >
          <RefreshCcw
            className={cn("size-4 mr-2", { "animate-spin": loadingRegenerate })}
          />
          Restablecer Evaluación
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Restablecer Evaluación</SheetTitle>
        </SheetHeader>

        <div className="grid gap-6 py-6">
          <div className="space-y-3">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Modo de regeneración</h4>
              <p className="text-sm text-muted-foreground">
                Selecciona cómo deseas regenerar la evaluación.
              </p>
            </div>

            <SearchableSelect
              options={modeOptions}
              value={mode}
              onChange={setMode}
              placeholder="Seleccionar modo"
              className="w-full!"
              withValue={false}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Opciones adicionales</h4>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="reset-progress"
                  checked={resetProgress}
                  onCheckedChange={(checked) => setResetProgress(!!checked)}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="reset-progress"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Reiniciar progreso
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Elimina todo el progreso actual de la evaluación
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="force"
                  checked={force}
                  onCheckedChange={(checked) => setForce(!!checked)}
                  className="mt-0.5"
                />
                <div className="space-y-1">
                  <label
                    htmlFor="force"
                    className="text-sm font-medium leading-none cursor-pointer"
                  >
                    Forzar regeneración
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Fuerza la regeneración incluso si hay conflictos
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loadingRegenerate}
          >
            Cancelar
          </Button>
          <Button onClick={handleRegenerate} disabled={loadingRegenerate}>
            {loadingRegenerate ? (
              <>
                <RefreshCcw className="size-4 mr-2 animate-spin" />
                Regenerando...
              </>
            ) : (
              <>
                <RefreshCcw className="size-4 mr-2" />
                Regenerar
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
