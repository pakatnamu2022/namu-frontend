import { Control, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button.tsx";
import { Plus, X } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput.tsx";
import { FormSelect } from "@/shared/components/FormSelect.tsx";
import { WorkerResource } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.interface.ts";

interface Props {
  control: Control<any>;
  workers: WorkerResource[];
  isLoadingWorkers?: boolean;
}

export default function ConceptObjectiveAdvisorsField({
  control,
  workers,
  isLoadingWorkers,
}: Props) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "advisors",
  });

  const workerOptions = workers.map((worker) => ({
    label: worker.name,
    value: worker.id.toString(),
  }));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Asesores</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ worker_id: "", amount: 0 })}
        >
          <Plus className="size-4 mr-1" />
          Agregar Asesor
        </Button>
      </div>

      {fields.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Sin asesores asignados a este concepto.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-end gap-2">
            <FormSelect
              control={control}
              name={`advisors.${index}.worker_id`}
              placeholder="Seleccione asesor"
              options={workerOptions}
              isLoadingOptions={isLoadingWorkers}
              strictFilter
              className="w-88 shrink-0"
            />

            <FormInput
              control={control}
              name={`advisors.${index}.amount`}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-30 shrink-0"
            />

            <Button
              type="button"
              variant="outline"
              size="icon"
              className="shrink-0 mb-0.5"
              onClick={() => remove(index)}
            >
              <X className="size-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
