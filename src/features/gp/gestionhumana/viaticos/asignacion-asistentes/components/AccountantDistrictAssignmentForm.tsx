"use client";

import { useForm } from "react-hook-form";
import {
  AccountantDistrictAssignmentSchema,
  accountantDistrictAssignmentSchemaCreate,
  accountantDistrictAssignmentSchemaUpdate,
} from "../lib/accountantDistrictAssignment.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useDistrictsSedes } from "@/features/ap/configuraciones/maestros-general/ubigeos/lib/district.hook";
import { Option } from "@/core/core.interface";

interface AccountantDistrictAssignmentFormProps {
  defaultValues: Partial<AccountantDistrictAssignmentSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  workerDefaultOption?: Option;
  districtDefaultOption?: Option;
}

export const AccountantDistrictAssignmentForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  mode = "create",
  onCancel,
  workerDefaultOption,
  districtDefaultOption,
}: AccountantDistrictAssignmentFormProps) => {
  const form = useForm({
    resolver: zodResolver(
      mode === "create"
        ? accountantDistrictAssignmentSchemaCreate
        : accountantDistrictAssignmentSchemaUpdate,
    ),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormSelectAsync
            control={form.control}
            name="worker_id"
            label="Trabajador"
            placeholder="Buscar trabajador..."
            useQueryHook={useWorkers}
            mapOptionFn={(worker) => ({
              value: worker.id.toString(),
              label: worker.name,
              description: `${worker.document} - ${worker.position}`,
            })}
            perPage={10}
            debounceMs={500}
            defaultOption={workerDefaultOption}
            required
          />
          <FormSelectAsync
            control={form.control}
            name="district_id"
            label="Distrito"
            placeholder="Buscar distrito..."
            useQueryHook={useDistrictsSedes}
            mapOptionFn={(district) => ({
              value: district.id.toString(),
              label: district.name,
              description: `${district.province} - ${district.department}`,
            })}
            perPage={10}
            debounceMs={500}
            defaultOption={districtDefaultOption}
            required
          />
        </div>
        <div className="flex gap-4 w-full justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || !form.formState.isValid}
          >
            <Loader
              className={`mr-2 h-4 w-4 ${!isSubmitting ? "hidden" : ""}`}
            />
            {isSubmitting ? "Guardando" : "Guardar Asignación"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
