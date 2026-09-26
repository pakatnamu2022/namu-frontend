"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormInput } from "@/shared/components/FormInput";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { updateLifePolicy } from "../lib/life-policy.actions";
import { LIFE_POLICY } from "../lib/life-policy.constants";
import { LifePolicyResource } from "../lib/life-policy.interface";
import {
  LifePolicyUpdateSchema,
  lifePolicySchemaUpdate,
} from "../lib/life-policy.schema";

const { MODEL, QUERY_KEY } = LIFE_POLICY;

interface Props {
  policy: LifePolicyResource;
  onClose: () => void;
}

const toNumber = (v?: string) => (v === undefined || v === "" ? undefined : Number(v));

export default function LifePolicyEditModal({ policy, onClose }: Props) {
  const queryClient = useQueryClient();

  const form = useForm<LifePolicyUpdateSchema>({
    resolver: zodResolver(lifePolicySchemaUpdate),
    defaultValues: {
      insurer: policy.insurer ?? "",
      policy_number: policy.policy_number ?? "",
      start_date: policy.start_date,
      end_date: policy.end_date,
      monthly_rate: String((Number(policy.monthly_rate) * 100).toFixed(4)),
      exclusion: policy.exclusion ?? "",
    },
    mode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: LifePolicyUpdateSchema) =>
      updateLifePolicy(policy.id, {
        insurer: d.insurer || undefined,
        policy_number: d.policy_number || undefined,
        start_date: d.start_date,
        end_date: d.end_date,
        monthly_rate:
          toNumber(d.monthly_rate) !== undefined
            ? (toNumber(d.monthly_rate) as number) / 100
            : undefined,
        exclusion: toNumber(d.exclusion),
      }),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE(MODEL, "update"),
      );
    },
  });

  return (
    <GeneralModal open onClose={onClose} title={`Editar ${MODEL.name}`}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="space-y-4 w-full"
        >
          <p className="text-xs text-muted-foreground">
            Al guardar se recalculan los sueldos asegurados y los totales de
            la póliza con los datos nuevos (empresa y prima neta no se
            editan aquí: la prima se recalcula sola).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              name="insurer"
              label="Aseguradora"
              placeholder="Ej: Pacífico Seguros"
              control={form.control}
            />
            <FormInput
              name="policy_number"
              label="N° de Póliza"
              placeholder="Ej: 1234567"
              control={form.control}
            />
            <DatePickerFormField
              control={form.control}
              name="start_date"
              label="Inicio de vigencia"
              captionLayout="dropdown"
              startMonth={new Date(2020, 0)}
            />
            <DatePickerFormField
              control={form.control}
              name="end_date"
              label="Fin de vigencia"
              captionLayout="dropdown"
              startMonth={new Date(2020, 0)}
              endMonth={new Date(new Date().getFullYear() + 3, 11)}
            />
            <FormInput
              name="monthly_rate"
              label="Tasa mensual (%)"
              placeholder="Opcional. Ej: 0.26"
              control={form.control}
              tooltip={
                <div className="space-y-1.5 max-w-[260px]">
                  <p>
                    Si la dejas vacía, el sistema usa la tasa anual
                    configurada ÷ 12 automáticamente.
                  </p>
                  <p className="font-medium">Cómo se calcula:</p>
                  <p>
                    Tasa mensual = Prima neta prorrateada ÷ Total de sueldos
                    asegurados ÷ 12
                  </p>
                  <p className="italic">Ejemplo: da 0.26</p>
                </div>
              }
            />
            <FormInput
              name="exclusion"
              label="Exclusión (S/)"
              placeholder="Opcional. Ej: 0.00"
              control={form.control}
            />
          </div>

          <div className="flex gap-4 w-full justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isPending ? "hidden" : ""}`}
              />
              {isPending ? "Guardando y recalculando" : "Guardar y recalcular"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
