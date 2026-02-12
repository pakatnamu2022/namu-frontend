"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormInput } from "@/shared/components/FormInput";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { assignEquipment } from "../lib/equipment.actions";
import { errorToast, successToast } from "@/core/core.function";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";

interface Props {
  open: boolean;
  equipmentId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface AssignFormValues {
  worker_id: string;
  fecha: string;
  observacion: string;
}

export default function EquipmentAssignModal({
  open,
  equipmentId,
  onClose,
  onSuccess,
}: Props) {
  const form = useForm<AssignFormValues>({
    defaultValues: {
      worker_id: "",
      fecha: new Date().toISOString().split("T")[0],
      observacion: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: AssignFormValues) =>
      assignEquipment({
        persona_id: Number(values.worker_id),
        fecha: new Date(values.fecha).toISOString().split("T")[0],
        observacion: values.observacion,
        items: [
          {
            equipo_id: equipmentId,
            observacion: values.observacion,
          },
        ],
      }),
    onSuccess: () => {
      successToast("Equipo asignado correctamente.");
      form.reset();
      onSuccess();
      onClose();
    },
    onError: () => {
      errorToast("Error al asignar el equipo.");
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    if (!values.worker_id) return;
    mutate(values);
  });

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title="Asignar equipo"
      subtitle="Selecciona el trabajador para asignar este equipo"
      icon="UserPlus"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          <FormSelectAsync
            name="worker_id"
            label="Trabajador"
            placeholder="Selecciona un trabajador"
            control={form.control}
            useQueryHook={useWorkers}
            mapOptionFn={(item) => ({
              label: item.name,
              value: item.id.toString(),
            })}
            perPage={10}
            debounceMs={500}
          />

          <DatePickerFormField
            name="fecha"
            label="Fecha de asignación"
            control={form.control}
            dateFormat="dd/MM/yyyy"
            placeholder="Selecciona la fecha de asignación"
          />

          <FormInput
            name="observacion"
            label="Observación"
            placeholder="Observación (opcional)"
            control={form.control}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Asignando..." : "Asignar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
