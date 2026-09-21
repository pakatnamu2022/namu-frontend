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
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import { storeLifePolicy } from "../lib/life-policy.actions";
import { LIFE_POLICY } from "../lib/life-policy.constants";
import {
  LifePolicyCreateSchema,
  lifePolicySchemaCreate,
} from "../lib/life-policy.schema";

const { MODEL, QUERY_KEY } = LIFE_POLICY;

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCompanyId?: string;
}

const toNumber = (v?: string) => (v === undefined || v === "" ? undefined : Number(v));

export default function LifePolicyModal({
  open,
  onClose,
  defaultCompanyId,
}: Props) {
  const queryClient = useQueryClient();
  const { data: companies } = useAllCompanies();

  const form = useForm<LifePolicyCreateSchema>({
    resolver: zodResolver(lifePolicySchemaCreate),
    defaultValues: {
      company_id: defaultCompanyId ?? "",
      insurer: "",
      policy_number: "",
      start_date: "",
      end_date: "",
      monthly_rate: "",
      exclusion: "",
      net_premium: "",
    },
    mode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: LifePolicyCreateSchema) =>
      storeLifePolicy({
        company_id: Number(d.company_id),
        insurer: d.insurer || undefined,
        policy_number: d.policy_number || undefined,
        start_date: d.start_date,
        end_date: d.end_date,
        monthly_rate:
          toNumber(d.monthly_rate) !== undefined
            ? (toNumber(d.monthly_rate) as number) / 100
            : undefined,
        exclusion: toNumber(d.exclusion),
        net_premium: toNumber(d.net_premium),
      }),
    onSuccess: async (result) => {
      const skipped = result.skipped.length;
      successToast(
        skipped > 0
          ? `Póliza creada. ${skipped} trabajador(es) sin sueldo no fueron asegurados.`
          : SUCCESS_MESSAGE(MODEL, "create"),
      );
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE(MODEL, "create"),
      );
    },
  });

  return (
    <GeneralModal open={open} onClose={onClose} title={`Crear ${MODEL.name}`}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="space-y-4 w-full"
        >
          <p className="text-xs text-muted-foreground">
            Al emitir la póliza se asegura a los trabajadores activos de la
            empresa con su sueldo vigente al inicio de la póliza (más asignación
            familiar) y se calcula una sola vez el monto mensual de cada uno.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormSelect
                control={form.control}
                name="company_id"
                label="Empresa"
                placeholder="Selecciona una empresa"
                options={(companies ?? []).map((c) => ({
                  value: String(c.id),
                  label: c.name,
                }))}
                required
              />
            </div>
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
            />
            <FormInput
              name="exclusion"
              label="Exclusión (S/)"
              placeholder="Opcional. Ej: 0.00"
              control={form.control}
            />
            <div className="sm:col-span-2">
              <FormInput
                name="net_premium"
                label="Prima neta (S/)"
                placeholder="Opcional. Si se deja vacío se calcula con la tasa"
                control={form.control}
              />
            </div>
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
              {isPending ? "Guardando" : `Guardar ${MODEL.name}`}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
