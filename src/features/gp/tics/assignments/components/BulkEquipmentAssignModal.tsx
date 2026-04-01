"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormInput } from "@/shared/components/FormInput";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { useWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import { useEquipments } from "@/features/gp/tics/equipment/lib/equipment.hook";
import { bulkAssignEquipment } from "../lib/assignments.actions";
import { errorToast, successToast } from "@/core/core.function";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { BulkEquipmentAssignFormValues } from "../lib/assignments.interface";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const emptyItem = { equipo_id: "", observacion: "" };

export default function BulkEquipmentAssignModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const form = useForm<BulkEquipmentAssignFormValues>({
    defaultValues: {
      worker_id: "",
      fecha: new Date().toISOString().split("T")[0],
      observacion: "",
      items: [emptyItem],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (values: BulkEquipmentAssignFormValues) =>
      bulkAssignEquipment({
        persona_id: Number(values.worker_id),
        fecha: new Date(values.fecha).toISOString().split("T")[0],
        observacion: values.observacion,
        items: values.items.map((item) => ({
          equipo_id: Number(item.equipo_id),
          observacion: item.observacion,
        })),
      }),
    onSuccess: () => {
      successToast("Equipos asignados correctamente.");
      form.reset({ ...form.formState.defaultValues, items: [emptyItem] });
      onSuccess();
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message || "Error al asignar los equipos.",
      );
    },
  });

  const handleClose = () => {
    form.reset({ worker_id: "", fecha: new Date().toISOString().split("T")[0], observacion: "", items: [emptyItem] });
    onClose();
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (!values.worker_id) return;
    const validItems = values.items.filter((i) => i.equipo_id !== "");
    if (validItems.length === 0) return;
    mutate({ ...values, items: validItems });
  });

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Asignación masiva de equipos"
      subtitle="Selecciona el trabajador y los equipos a asignar"
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
            required
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
            label="Observación general"
            placeholder="Observación (opcional)"
            control={form.control}
          />

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Equipos ({fields.length})
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append(emptyItem)}
                disabled={isPending}
              >
                <Plus className="size-4 mr-1" />
                Agregar equipo
              </Button>
            </div>

            <ScrollArea className="max-h-64 pr-2">
              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="rounded-md border p-3 space-y-2 bg-muted/30"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground font-medium">
                        Equipo {index + 1}
                      </span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="size-6 text-destructive hover:text-destructive"
                          onClick={() => remove(index)}
                          disabled={isPending}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
                    <FormSelectAsync
                      name={`items.${index}.equipo_id`}
                      placeholder="Selecciona un equipo"
                      control={form.control}
                      useQueryHook={useEquipments}
                      mapOptionFn={(item) => ({
                        label: `${item.equipo} - ${item.serie}`,
                        value: item.id.toString(),
                        description: item.tipo_equipo,
                      })}
                      additionalParams={{ status_id: 28 }}
                      perPage={10}
                      debounceMs={500}
                      required
                    />
                    <FormInput
                      name={`items.${index}.observacion`}
                      placeholder="Observación del equipo (opcional)"
                      control={form.control}
                    />
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Asignando..." : `Asignar ${fields.length > 1 ? `(${fields.length} equipos)` : "equipo"}`}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
