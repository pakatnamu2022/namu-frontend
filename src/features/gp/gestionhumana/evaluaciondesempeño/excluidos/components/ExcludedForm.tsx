"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { ExcludedSchema, excludedSchemaCreate } from "../lib/excluded.schema";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { WorkerResource } from "../../../personal/trabajadores/lib/worker.interface";
import { Form } from "@/components/ui/form";
import { EXCLUDED } from "../lib/excluded.constants";

const { MODEL } = EXCLUDED;

interface Props {
  defaultValues: Partial<ExcludedSchema>;
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  persons: WorkerResource[];
  onCancel?: () => void;
  portalContainer?: HTMLElement | null; // SOLO SI ES UN FORM SELECT DENTRO DE UN DIALOG
}

export const ExcludedForm = ({
  defaultValues,
  onSubmit,
  isSubmitting = false,
  persons,
  onCancel,
  portalContainer,
}: Props) => {
  const form = useForm({
    resolver: zodResolver(excludedSchemaCreate),
    defaultValues: {
      ...defaultValues,
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <div className="grid grid-cols-1 gap-4">
          <FormSelect
            control={form.control}
            name="person_id"
            label="Colaborador"
            placeholder="Selecciona un colaborador"
            options={persons.map((p) => ({
              value: p.id.toString(),
              label: p.name,
            }))}
            strictFilter={true}
            portalContainer={portalContainer} // SE LE PASA AL SELECT FORM
          />
        </div>

        {/* <pre>
          <code className="text-xs text-muted-foreground">
            {JSON.stringify(form.getValues(), null, 2)}
          </code>
        </pre> */}

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
            {isSubmitting ? "Guardando" : `Guardar ${MODEL.name}`}
          </Button>
        </div>
      </form>
    </Form>
  );
};
