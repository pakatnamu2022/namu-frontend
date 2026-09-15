"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { lifeStatusSchema, LifeStatusSchema } from "../lib/selectedWorker.schema.ts";
import { SelectedWorkerResource } from "../lib/selectedWorker.interface.ts";
import { LIFE_STATUS } from "../lib/selectedWorker.constant.ts";

interface Props {
  worker: SelectedWorkerResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (data: LifeStatusSchema) => Promise<void>;
  isLoading?: boolean;
}

const OPTIONS = [
  { value: String(LIFE_STATUS.ALTA), label: "Alta" },
  { value: String(LIFE_STATUS.BAJA), label: "Baja" },
];

export default function ChangeLifeStatusDialog({
  worker,
  open,
  onOpenChange,
  onConfirm,
  isLoading = false,
}: Props) {
  const form = useForm<LifeStatusSchema>({
    resolver: zodResolver(lifeStatusSchema),
    defaultValues: { estado: "", fecha: "", motivo: "" },
    mode: "onChange",
  });

  useEffect(() => {
    if (open) form.reset({ estado: "", fecha: "", motivo: "" });
  }, [open, form]);

  const handleClose = () => onOpenChange(false);
  const canAlta = worker?.carta_oferta_firmada;

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Dar de alta / baja"
      subtitle={worker ? worker.nombre_completo : undefined}
      icon="UserCheck"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onConfirm)} className="space-y-4">
          {!canAlta && (
            <p className="text-xs text-amber-600">
              El trabajador aún no tiene la carta oferta firmada: solo se puede
              registrar la baja hasta que se suba la carta firmada.
            </p>
          )}
          <FormSelect
            control={form.control}
            name="estado"
            label="Estado"
            placeholder="Seleccionar..."
            options={
              canAlta
                ? OPTIONS
                : OPTIONS.filter((o) => o.value === String(LIFE_STATUS.BAJA))
            }
            required
          />
          <FormInput
            control={form.control}
            name="fecha"
            label="Fecha"
            type="date"
            required
          />
          <FormInput control={form.control} name="motivo" label="Motivo" />

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !form.formState.isValid}>
              <Loader
                className={`mr-2 h-4 w-4 ${!isLoading ? "hidden" : "animate-spin"}`}
              />
              Guardar
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
