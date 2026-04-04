"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormInput } from "@/shared/components/FormInput";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Staging mini-form for adding a single item
  const stagingForm = useForm<{ equipo_id: string; observacion: string }>({
    defaultValues: { equipo_id: "", observacion: "" },
  });

  // Label lookup map: equipo_id -> display label
  const labelMapRef = useRef<Map<string, string>>(new Map());
  const [stagingLabel, setStagingLabel] = useState("");

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
      form.reset({ ...form.formState.defaultValues, items: [] });
      stagingForm.reset();
      labelMapRef.current.clear();
      setStagingLabel("");
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
    form.reset({
      worker_id: "",
      fecha: new Date().toISOString().split("T")[0],
      observacion: "",
      items: [],
    });
    stagingForm.reset();
    labelMapRef.current.clear();
    setStagingLabel("");
    onClose();
  };

  const handleSubmit = form.handleSubmit((values) => {
    if (!values.worker_id) return;
    if (values.items.length === 0) return;
    mutate(values);
  });

  const handleAddItem = stagingForm.handleSubmit((staging) => {
    if (!staging.equipo_id) return;
    labelMapRef.current.set(staging.equipo_id, stagingLabel);
    append({ equipo_id: staging.equipo_id, observacion: staging.observacion });
    stagingForm.reset({ equipo_id: "", observacion: "" });
    setStagingLabel("");
  });

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Asignación masiva de equipos"
      subtitle="Selecciona el trabajador y los equipos a asignar"
      icon="UserPlus"
      size="2xl"
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

          {/* Mini-form para agregar un equipo */}
          <div className="space-y-2">
            <span className="text-sm font-medium">
              Equipos ({fields.length})
            </span>

            <Form {...stagingForm}>
              <div className="flex gap-2 items-end rounded-md border p-3 bg-muted/20">
                <div className="flex-1 min-w-0">
                  <FormSelectAsync
                    name="equipo_id"
                    label="Equipo"
                    placeholder="Selecciona un equipo"
                    control={stagingForm.control}
                    useQueryHook={useEquipments}
                    mapOptionFn={(item) => ({
                      label: `${item.equipo} - ${item.serie}`,
                      value: item.id.toString(),
                      description: item.tipo_equipo,
                    })}
                    additionalParams={{ status_id: 28, isAssigned: 0 }}
                    perPage={10}
                    debounceMs={500}
                    onValueChange={(_val, item) => {
                      if (item) {
                        setStagingLabel(`${item.equipo} - ${item.serie}`);
                      } else {
                        setStagingLabel("");
                      }
                    }}
                    required
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <FormInput
                    name="observacion"
                    label="Observación"
                    placeholder="Observación del equipo (opcional)"
                    control={stagingForm.control}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mb-0.5 shrink-0"
                  onClick={handleAddItem}
                  disabled={isPending}
                >
                  <Plus className="size-4 mr-1" />
                  Agregar
                </Button>
              </div>
            </Form>

            {/* Tabla de equipos agregados */}
            {fields.length > 0 && (
              <ScrollArea className="max-h-56 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10 h-9 px-3">#</TableHead>
                      <TableHead className="h-9 px-3">Equipo</TableHead>
                      <TableHead className="h-9 px-3">Observación</TableHead>
                      <TableHead className="w-10 h-9 px-3" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className="py-2 px-3 text-muted-foreground text-xs">
                          {index + 1}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs font-medium max-w-[180px] truncate">
                          {labelMapRef.current.get(field.equipo_id) ||
                            field.equipo_id}
                        </TableCell>
                        <TableCell className="py-2 px-3 text-xs text-muted-foreground max-w-40 truncate">
                          {field.observacion || (
                            <span className="italic">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 px-3">
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
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}

            {fields.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4 border rounded-md border-dashed">
                Aún no se han agregado equipos. Usa el formulario de arriba para
                añadir.
              </p>
            )}
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
            <Button type="submit" disabled={isPending || fields.length === 0}>
              {isPending
                ? "Asignando..."
                : `Asignar${fields.length > 0 ? ` (${fields.length} ${fields.length === 1 ? "equipo" : "equipos"})` : ""}`}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
