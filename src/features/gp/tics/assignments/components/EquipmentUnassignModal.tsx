"use client";

import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { unassignEquipment } from "@/features/gp/tics/equipment/lib/equipment.actions";
import { errorToast, successToast } from "@/core/core.function";
import { FormTextArea } from "@/shared/components/FormTextArea";

interface Props {
  open: boolean;
  assignmentId: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface UnassignFormValues {
  fecha: string;
  observacion_unassign: string;
}

export default function EquipmentUnassignModal({
  open,
  assignmentId,
  onClose,
  onSuccess,
}: Props) {
  const form = useForm<UnassignFormValues>({
    defaultValues: {
      fecha: new Date().toISOString().split("T")[0],
      observacion_unassign: "",
    },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: UnassignFormValues) =>
      unassignEquipment(assignmentId, {
        fecha: new Date(values.fecha).toISOString().split("T")[0],
        observacion_unassign: values.observacion_unassign,
      }),
    onSuccess: () => {
      successToast("Equipo desasignado correctamente.");
      form.reset();
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al desasignar el equipo.",
      );
    },
  });

  const handleClose = () => {
    form.reset();
    onClose();
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Desasignar equipo"
      subtitle="Ingresa la fecha y motivo de la devolución"
      icon="PackageOpen"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((v) => mutate(v))}
          className="space-y-4 p-2"
        >
          <DatePickerFormField
            name="fecha"
            label="Fecha de devolución"
            control={form.control}
            dateFormat="dd/MM/yyyy"
            placeholder="Selecciona la fecha"
          />

          <FormTextArea
            name="observacion_unassign"
            label="Observación"
            placeholder="Motivo de la devolución (opcional)"
            control={form.control}
            uppercase
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
