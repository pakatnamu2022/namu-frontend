"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calculator, Loader } from "lucide-react";
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
import { FormTextArea } from "@/shared/components/FormTextArea";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { useAllWorkers } from "@/features/gp/gestionhumana/gestion-de-personal/trabajadores/lib/worker.hook";
import {
  estimateSubsidy,
  storeSubsidy,
  updateSubsidy,
} from "../lib/subsidy.actions";
import { SUBSIDY, SUBSIDY_TYPES } from "../lib/subsidy.constants";
import { SubsidyEstimate, SubsidyResource } from "../lib/subsidy.interface";
import {
  SubsidyCreateSchema,
  subsidySchemaCreate,
} from "../lib/subsidy.schema";

const { MODEL, QUERY_KEY } = SUBSIDY;

interface Props {
  open: boolean;
  onClose: () => void;
  subsidy?: SubsidyResource | null;
}

export default function SubsidyModal({ open, onClose, subsidy }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!subsidy;
  const [estimate, setEstimate] = useState<SubsidyEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  const { data: workers, isLoading: isLoadingWorkers } = useAllWorkers(
    { status_id: 22 },
    open,
  );

  const form = useForm<SubsidyCreateSchema>({
    resolver: zodResolver(subsidySchemaCreate),
    defaultValues: {
      worker_id: subsidy ? String(subsidy.worker_id) : "",
      type: subsidy?.type ?? "INCAPACIDAD_TEMPORAL",
      start_date: subsidy?.start_date ?? "",
      end_date: subsidy?.end_date ?? "",
      amount: subsidy ? String(Number(subsidy.amount)) : "",
      reference: subsidy?.reference ?? "",
      notes: subsidy?.notes ?? "",
    },
    mode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: SubsidyCreateSchema) => {
      const amount = d.amount === undefined || d.amount === "" ? undefined : Number(d.amount);
      if (subsidy) {
        return updateSubsidy(subsidy.id, {
          type: d.type,
          start_date: d.start_date,
          end_date: d.end_date,
          amount,
          reference: d.reference || null,
          notes: d.notes || null,
        });
      }
      return storeSubsidy({
        worker_id: Number(d.worker_id),
        type: d.type,
        start_date: d.start_date,
        end_date: d.end_date,
        amount,
        reference: d.reference || undefined,
        notes: d.notes || undefined,
      });
    },
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, isEdit ? "update" : "create"));
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message,
        ERROR_MESSAGE(MODEL, isEdit ? "update" : "create"),
      );
    },
  });

  const handleEstimate = async () => {
    const { worker_id, start_date, end_date } = form.getValues();
    if (!worker_id || !start_date || !end_date) {
      errorToast("Completa trabajador y fechas para estimar el monto");
      return;
    }
    setIsEstimating(true);
    try {
      const result = await estimateSubsidy({
        worker_id: Number(worker_id),
        start_date,
        end_date,
      });
      setEstimate(result);
      form.setValue("amount", String(result.amount), {
        shouldValidate: true,
        shouldDirty: true,
      });
    } catch (error: any) {
      setEstimate(null);
      errorToast(
        error.response?.data?.message,
        "No se pudo estimar el monto",
      );
    } finally {
      setIsEstimating(false);
    }
  };

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={isEdit ? `Editar ${MODEL.name}` : `Crear ${MODEL.name}`}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="space-y-4 w-full"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <FormSelect
                control={form.control}
                name="worker_id"
                label="Trabajador"
                placeholder="Selecciona un trabajador"
                options={(isLoadingWorkers ? [] : (workers ?? [])).map((w) => ({
                  value: w.id.toString(),
                  label: w.name,
                }))}
                strictFilter={true}
                disabled={isEdit}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <FormSelect
                control={form.control}
                name="type"
                label="Tipo de subsidio"
                options={SUBSIDY_TYPES}
                required
              />
            </div>
            <DatePickerFormField
              control={form.control}
              name="start_date"
              label="Inicio del descanso"
              captionLayout="dropdown"
              startMonth={new Date(2020, 0)}
            />
            <DatePickerFormField
              control={form.control}
              name="end_date"
              label="Fin del descanso"
              captionLayout="dropdown"
              startMonth={new Date(2020, 0)}
            />
            <div className="sm:col-span-2 space-y-2">
              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <FormInput
                    name="amount"
                    label="Monto del subsidio (S/)"
                    placeholder="Vacío = se estima automáticamente"
                    control={form.control}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isEstimating}
                  onClick={handleEstimate}
                >
                  {isEstimating ? (
                    <Loader className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Calculator className="mr-2 h-4 w-4" />
                  )}
                  Estimar monto
                </Button>
              </div>
              {estimate && (
                <p className="text-xs text-muted-foreground">
                  Promedio diario S/ {estimate.daily_average.toFixed(4)} (
                  {estimate.months_counted} mes(es) de historial, total S/{" "}
                  {estimate.total_remuneration.toFixed(2)}) × {estimate.days}{" "}
                  días.
                </p>
              )}
            </div>
            <div className="sm:col-span-2">
              <FormInput
                name="reference"
                label="Referencia (N° CITT / certificado)"
                placeholder="Opcional"
                control={form.control}
              />
            </div>
            <div className="sm:col-span-2">
              <FormTextArea
                name="notes"
                label="Observaciones"
                placeholder="Opcional"
                control={form.control}
                rows={2}
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
