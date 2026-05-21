"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { FormInput } from "@/shared/components/FormInput";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import {
  Plus,
  Trash2,
  MessageSquare,
  Package,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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

  const stagingForm = useForm<{ equipo_id: string; observacion: string }>({
    defaultValues: { equipo_id: "", observacion: "" },
  });

  const labelMapRef = useRef<Map<string, string>>(new Map());
  const [stagingLabel, setStagingLabel] = useState("");
  const [showStagingObs, setShowStagingObs] = useState(false);
  const [showGeneralObs, setShowGeneralObs] = useState(false);

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
      setShowStagingObs(false);
      setShowGeneralObs(false);
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
    setShowStagingObs(false);
    setShowGeneralObs(false);
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
    setShowStagingObs(false);
  });

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Asignación masiva de equipos"
      subtitle="Selecciona el trabajador y los equipos a asignar"
      icon="UserPlus"
      size="3xl"
    >
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-5 p-2">
          {/* Trabajador + Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
              placeholder="Selecciona la fecha"
            />
          </div>

          {/* Observación general (toggle) */}
          <div>
            <button
              type="button"
              onClick={() => setShowGeneralObs((prev) => !prev)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <MessageSquare className="size-3.5" />
              {showGeneralObs
                ? "Ocultar observación general"
                : "Agregar observación general"}
              {showGeneralObs ? (
                <ChevronUp className="size-3" />
              ) : (
                <ChevronDown className="size-3" />
              )}
            </button>
            {showGeneralObs && (
              <div className="mt-2">
                <FormInput
                  name="observacion"
                  label="Observación general"
                  placeholder="Aplica a todos los equipos de esta asignación"
                  control={form.control}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Sección equipos */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Equipos a asignar</span>
              {fields.length > 0 && (
                <Badge
                  variant="ghost"
                  className="text-xs h-5 px-1.5 py-0.5"
                >
                  {fields.length}
                </Badge>
              )}
            </div>

            {/* Mini-form para agregar equipo */}
            <Form {...stagingForm}>
              <div className="rounded-lg border bg-muted/20 p-3 space-y-3">
                <FormSelectAsync
                  name="equipo_id"
                  label="Equipo"
                  placeholder="Busca y selecciona un equipo"
                  control={stagingForm.control}
                  useQueryHook={useEquipments}
                  mapOptionFn={(item) => ({
                    label: `${item.equipo} - ${item.serie}`,
                    value: item.id.toString(),
                    description: item.tipo_equipo,
                  })}
                  additionalParams={{ status_id: 28, assignable: 1 }}
                  perPage={10}
                  debounceMs={500}
                  onValueChange={(_val, item) => {
                    setStagingLabel(
                      item ? `${item.equipo} - ${item.serie}` : "",
                    );
                  }}
                  required
                />

                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setShowStagingObs((prev) => !prev)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MessageSquare className="size-3.5" />
                    {showStagingObs
                      ? "Ocultar observación"
                      : "Agregar observación al equipo"}
                    {showStagingObs ? (
                      <ChevronUp className="size-3" />
                    ) : (
                      <ChevronDown className="size-3" />
                    )}
                  </button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddItem}
                    disabled={isPending}
                    className="h-7 text-xs shrink-0"
                  >
                    <Plus className="size-3.5 mr-1" />
                    Agregar equipo
                  </Button>
                </div>

                {showStagingObs && (
                  <FormInput
                    name="observacion"
                    label="Observación del equipo"
                    placeholder="Nota específica para este equipo (opcional)"
                    control={stagingForm.control}
                  />
                )}
              </div>
            </Form>

            {/* Lista de equipos */}
            {fields.length > 0 ? (
              <ScrollArea className="max-h-52 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-8 h-8 px-3 text-center">#</TableHead>
                      <TableHead className="h-8 px-3">Equipo</TableHead>
                      <TableHead className="h-8 px-3">Observación</TableHead>
                      <TableHead className="w-8 h-8 px-3" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id} className="group">
                        <TableCell className="py-1.5 px-3 text-center">
                          <span className="text-xs text-muted-foreground font-mono">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 px-3 max-w-[180px]">
                          <span className="text-xs font-medium truncate block">
                            {labelMapRef.current.get(field.equipo_id) ||
                              field.equipo_id}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 px-3 max-w-[140px]">
                          {field.observacion ? (
                            <span className="text-xs text-muted-foreground truncate block">
                              {field.observacion}
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground/40 italic">
                              Sin observación
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 px-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="size-6 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
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
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-8 rounded-lg border border-dashed text-muted-foreground">
                <Package className="size-8 opacity-25" />
                <p className="text-xs text-center leading-relaxed">
                  No hay equipos agregados aún.
                  <br />
                  Usa el formulario de arriba para añadir.
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isPending || fields.length === 0}
            >
              {isPending
                ? "Asignando..."
                : fields.length > 0
                  ? `Asignar ${fields.length} ${fields.length === 1 ? "equipo" : "equipos"}`
                  : "Asignar equipos"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
