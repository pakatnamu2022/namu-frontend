"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelect } from "@/shared/components/FormSelect";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import { errorToast, successToast } from "@/core/core.function";
import { addActivityLocation } from "../lib/activities.actions";
import { ActivityLocationSchema, activityLocationSchema } from "../lib/activities.schema";

interface Props {
  activityId: number | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function ActivityLocationModal({ activityId, onOpenChange, onSuccess }: Props) {
  const { data: sedes = [] } = useAllSedes();
  const { data: currencies = [] } = useAllCurrencyTypes();
  const form = useForm({
    resolver: zodResolver(activityLocationSchema),
    defaultValues: { sede_id: "", location_name: "", currency_id: "", amount: 0, notes: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: ActivityLocationSchema) => addActivityLocation(activityId!, data),
    onSuccess: () => {
      successToast("Sede/ubicación agregada correctamente");
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "Error al agregar la sede/ubicación";
      errorToast(msg);
    },
  });

  return (
    <Dialog open={activityId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Sede/Ubicación</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
            <FormSelect
              name="sede_id"
              label="Sede"
              placeholder="Selecciona una sede"
              options={sedes.map((s) => ({ label: s.abreviatura, value: s.id.toString() }))}
              control={form.control}
            />
            <FormInput name="location_name" label="Nombre de la Ubicación" placeholder="Ej: Lima" control={form.control} />
            <FormSelect
              name="currency_id"
              label="Moneda"
              placeholder="Selecciona una moneda"
              options={currencies.map((c) => ({ label: `${c.name} (${c.symbol})`, value: c.id.toString() }))}
              control={form.control}
            />
            <FormInput name="amount" label="Monto" type="number" step="0.01" control={form.control} />
            <FormInput name="notes" label="Notas" control={form.control} />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                <Loader className={`mr-2 h-4 w-4 ${!isPending ? "hidden" : ""}`} />
                {isPending ? "Guardando" : "Guardar"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
