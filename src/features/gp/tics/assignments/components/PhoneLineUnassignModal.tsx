"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormInput } from "@/shared/components/FormInput";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { unassignPhoneLine } from "../lib/assignments.actions";
import { errorToast, successToast } from "@/core/core.function";
import { PhoneLineUnassignRequest } from "../lib/assignments.interface";

interface Props {
  open: boolean;
  assignmentId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface UnassignFormValues {
  unassigned_at: string;
  observacion_unassign: string;
}

export default function PhoneLineUnassignModal({
  open,
  assignmentId,
  onClose,
  onSuccess,
}: Props) {
  const form = useForm<UnassignFormValues>({
    defaultValues: {
      unassigned_at: new Date().toISOString().split("T")[0],
      observacion_unassign: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: UnassignFormValues) => {
      const payload: PhoneLineUnassignRequest = {
        unassigned_at: new Date(values.unassigned_at).toISOString().split("T")[0],
        observacion_unassign: values.observacion_unassign,
      };
      return unassignPhoneLine(assignmentId, payload);
    },
    onSuccess: () => {
      successToast("Línea telefónica desasignada correctamente.");
      form.reset();
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al desasignar la línea.",
      );
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.handleSubmit((values) => {
    mutate(values);
  });

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Desasignar línea telefónica"
      subtitle="Ingresa la fecha y motivo de la desasignación"
      icon="PhoneOff"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4 p-2">
          <DatePickerFormField
            name="unassigned_at"
            label="Fecha de desasignación"
            control={form.control}
            dateFormat="dd/MM/yyyy"
            placeholder="Selecciona la fecha"
          />

          <FormInput
            name="observacion_unassign"
            label="Observación"
            placeholder="Motivo de la desasignación (opcional)"
            control={form.control}
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
            <Button type="submit" disabled={isPending} color="rose">
              {isPending ? "Desasignando..." : "Desasignar"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
