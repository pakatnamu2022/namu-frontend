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
import { storeSctrRate } from "../lib/sctr-rate.actions";
import { SCTR_RATE } from "../lib/sctr-rate.constants";
import {
  SctrRateCreateSchema,
  sctrRateSchemaCreate,
} from "../lib/sctr-rate.schema";

const { MODEL, QUERY_KEY } = SCTR_RATE;

interface Props {
  open: boolean;
  onClose: () => void;
  defaultCompanyId?: string;
}

export default function SctrRateModal({
  open,
  onClose,
  defaultCompanyId,
}: Props) {
  const queryClient = useQueryClient();
  const { data: companies } = useAllCompanies();

  const form = useForm<SctrRateCreateSchema>({
    resolver: zodResolver(sctrRateSchemaCreate),
    defaultValues: {
      company_id: defaultCompanyId ?? "",
      health_rate: "",
      pension_rate: "",
      effective_from: "",
    },
    mode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: SctrRateCreateSchema) =>
      storeSctrRate({
        company_id: Number(data.company_id),
        // El formulario captura porcentaje; la API espera fracción (0.5% → 0.005).
        health_rate: Number(data.health_rate) / 100,
        pension_rate: Number(data.pension_rate) / 100,
        effective_from: data.effective_from,
      }),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
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
            Al crear una tasa nueva se cierra la vigente de la empresa el día
            anterior a la fecha de inicio.
          </p>
          <div className="grid grid-cols-1 gap-4">
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
            <div className="grid grid-cols-2 gap-4">
              <FormInput
                name="health_rate"
                label="Tasa Salud (%)"
                placeholder="Ej: 0.53"
                control={form.control}
                required
              />
              <FormInput
                name="pension_rate"
                label="Tasa Pensión (%)"
                placeholder="Ej: 0.53"
                control={form.control}
                required
              />
            </div>
            <DatePickerFormField
              control={form.control}
              name="effective_from"
              label="Vigente desde"
              captionLayout="dropdown"
              startMonth={new Date(2020, 0)}
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
              {isPending ? "Guardando" : `Guardar ${MODEL.name}`}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
