"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { assignPhoneLineWorker } from "../lib/phoneLine.actions";
import { errorToast, successToast } from "@/core/core.function";

interface Props {
  open: boolean;
  phoneLineId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface AssignFormValues {
  worker_id: string;
}

export default function PhoneLineAssignModal({
  open,
  phoneLineId,
  onClose,
  onSuccess,
}: Props) {
  const form = useForm<AssignFormValues>({
    defaultValues: { worker_id: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (worker_id: number) =>
      assignPhoneLineWorker(phoneLineId, worker_id),
    onSuccess: () => {
      successToast("Trabajador asignado correctamente.");
      form.reset();
      onSuccess();
      onClose();
    },
    onError: () => {
      errorToast("Error al asignar el trabajador.");
    },
  });

  const handleSubmit = form.handleSubmit((values) => {
    if (!values.worker_id) return;
    mutate(Number(values.worker_id));
  });

  return (
    <GeneralModal
      open={open}
      onClose={() => {
        form.reset();
        onClose();
      }}
      title="Asignar trabajador"
      subtitle="Selecciona el trabajador para asignar a esta línea"
      icon="UserPlus"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4">
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
