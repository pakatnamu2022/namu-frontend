"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RefreshCcw } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Option } from "@/core/core.interface";
import { RegenerateEvaluationPreviewModal } from "./RegenerateEvaluationPreviewModal";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { FormSelect } from "@/shared/components/FormSelect";
import { Form } from "@/components/ui/form";

interface RegenerateEvaluationParams {
  mode: "full_reset" | "sync_with_cycle" | "add_missing_only";
  reset_progress?: boolean;
  force?: boolean;
}

interface Props {
  evaluationId: number;
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

// Schema de validación con Zod
const regenerateFormSchema = z.object({
  mode: z.enum(["full_reset", "sync_with_cycle", "add_missing_only"], {
    error: "Selecciona un modo de regeneración",
  }),
  reset_progress: z.boolean().default(false),
  force: z.boolean().default(false),
});

type RegenerateFormValues = z.infer<typeof regenerateFormSchema>;

export default function RegenerateEvaluationSheet({
  evaluationId,
  onRegenerate,
  loadingRegenerate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const form = useForm<RegenerateFormValues>({
    resolver: zodResolver(regenerateFormSchema) as any,
    defaultValues: {
      mode: "add_missing_only",
      reset_progress: false,
      force: false,
    },
  });

  const handleOpenPreview = () => {
    // Cerrar el sheet y abrir el modal de preview
    setOpen(false);
    setPreviewModalOpen(true);
  };

  const handleConfirmRegenerate = () => {
    // Cuando se confirma en el modal de preview, ejecutar la regeneración
    const values = form.getValues();
    onRegenerate({
      mode: values.mode,
      reset_progress: values.reset_progress,
      force: values.force,
    });
  };

  const handleClose = () => {
    setOpen(false);
    form.reset(); // Resetear el formulario al cerrar
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        color="red"
        className="w-full md:w-auto"
        onClick={() => setOpen(true)}
        disabled={loadingRegenerate}
      >
        <RefreshCcw
          className={cn("size-4 mr-2", {
            "animate-spin": loadingRegenerate,
          })}
        />
        Restablecer Evaluación
      </Button>

      <GeneralSheet
        title="Restablecer Evaluación"
        subtitle="Selecciona las opciones para restablecer la evaluación"
        icon="RefreshCcw"
        open={open}
        size="xl"
        onClose={handleClose}
        childrenFooter={
          <div className="w-full flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loadingRegenerate}
            >
              Cancelar
            </Button>
            <Button onClick={handleOpenPreview} disabled={loadingRegenerate}>
              <RefreshCcw className="size-4 mr-2" />
              Regenerar
            </Button>
          </div>
        }
      >
        <Form {...form}>
          <div className="grid gap-6">
            <div className="space-y-3">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Modo de regeneración</h4>
                <p className="text-sm text-muted-foreground">
                  Selecciona cómo deseas regenerar la evaluación.
                </p>
              </div>

              <FormSelect
                name="mode"
                control={form.control}
                options={modeOptions}
                placeholder="Seleccionar modo"
                required
                withValue={false}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-medium">Opciones adicionales</h4>

              <div className="space-y-4">
                <FormSwitch
                  name="reset_progress"
                  text="Reiniciar progreso"
                  textDescription="Elimina todo el progreso actual de la evaluación"
                  control={form.control}
                  autoHeight
                />

                <FormSwitch
                  name="force"
                  text="Forzar regeneración"
                  textDescription="Fuerza la regeneración incluso si hay conflictos"
                  control={form.control}
                  autoHeight
                />
              </div>
            </div>
          </div>
        </Form>
      </GeneralSheet>

      {/* Modal de Preview */}
      <RegenerateEvaluationPreviewModal
        open={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        evaluationId={evaluationId}
        params={form.getValues()}
        onConfirm={handleConfirmRegenerate}
      />
    </>
  );
}
