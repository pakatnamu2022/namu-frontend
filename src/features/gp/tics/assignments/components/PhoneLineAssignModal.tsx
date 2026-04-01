"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { usePhoneLines } from "@/features/gp/tics/phoneLine/lib/phoneLine.hook";
import { assignPhoneLine } from "../lib/assignments.actions";
import { errorToast, successToast } from "@/core/core.function";
import { PhoneLineAssignFormValues } from "../lib/assignments.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PhoneLineAssignModal({ open, onClose, onSuccess }: Props) {
  const form = useForm<PhoneLineAssignFormValues>({
    defaultValues: { phone_line_id: "", worker_id: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: PhoneLineAssignFormValues) =>
      assignPhoneLine({
        phone_line_id: Number(values.phone_line_id),
        worker_id: Number(values.worker_id),
      }),
    onSuccess: () => {
      successToast("Línea telefónica asignada correctamente.");
      form.reset();
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al asignar la línea.",
      );
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (!values.phone_line_id || !values.worker_id) return;
    mutate(values);
  });

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Asignar línea telefónica"
      subtitle="Selecciona la línea y el trabajador a asignar"
      icon="Phone"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          <FormSelectAsync
            name="phone_line_id"
            label="Línea telefónica"
            placeholder="Selecciona una línea"
            control={form.control}
            useQueryHook={usePhoneLines}
            mapOptionFn={(item) => ({
              label: item.line_number,
              value: item.id.toString(),
              description: item.company,
            })}
            perPage={10}
            debounceMs={500}
            required
          />

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
            required
          />

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
