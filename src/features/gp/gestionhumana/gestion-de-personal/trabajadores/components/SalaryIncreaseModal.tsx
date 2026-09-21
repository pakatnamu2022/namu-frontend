"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { z } from "zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { errorToast, successToast } from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { storeSalaryIncrease } from "../lib/worker.actions";
import { WORKER } from "../lib/worker.constant";

const { QUERY_KEY } = WORKER;

const money = (value: number) =>
  `S/ ${value.toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

const todayIso = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const salaryIncreaseSchema = z.object({
  new_salary: z
    .string()
    .min(1, "El sueldo nuevo es obligatorio")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "El sueldo no es válido"),
  effective_date: z.string().min(1, "La fecha efectiva es obligatoria"),
  reason: z.string().max(255, "Máximo 255 caracteres").optional(),
});

type SalaryIncreaseSchema = z.infer<typeof salaryIncreaseSchema>;

interface Props {
  open: boolean;
  onClose: () => void;
  workerId: number;
  currentSalary: number | null;
}

export default function SalaryIncreaseModal({
  open,
  onClose,
  workerId,
  currentSalary,
}: Props) {
  const queryClient = useQueryClient();

  const form = useForm<SalaryIncreaseSchema>({
    resolver: zodResolver(salaryIncreaseSchema),
    defaultValues: { new_salary: "", effective_date: todayIso(), reason: "" },
    mode: "onChange",
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (d: SalaryIncreaseSchema) =>
      storeSalaryIncrease({
        worker_id: workerId,
        new_salary: Number(d.new_salary),
        effective_date: d.effective_date,
        // El sueldo de la ficha es el vigente; el del contrato legacy puede estar desactualizado.
        previous_salary: currentSalary ?? undefined,
        reason: d.reason || undefined,
      }),
    onSuccess: async () => {
      successToast("Aumento de sueldo registrado");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      form.reset();
      onClose();
    },
    onError: (error: any) => {
      errorToast(
        error.response?.data?.message,
        "No se pudo registrar el aumento de sueldo",
      );
    },
  });

  return (
    <GeneralModal open={open} onClose={onClose} title="Registrar aumento de sueldo">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((d) => mutate(d))}
          className="space-y-4 w-full"
        >
          <div className="rounded-2xl bg-muted/50 px-4 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Sueldo actual
            </p>
            <p className="text-xl font-semibold mt-1">
              {currentSalary != null ? money(currentSalary) : "-"}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput
              name="new_salary"
              label="Sueldo nuevo (S/)"
              placeholder="0.00"
              inputMode="decimal"
              control={form.control}
              required
            />
            <DatePickerFormField
              control={form.control}
              name="effective_date"
              label="Fecha efectiva"
              captionLayout="dropdown"
              startMonth={new Date(2020, 0)}
            />
            <div className="sm:col-span-2">
              <FormTextArea
                name="reason"
                label="Motivo"
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
              {isPending ? "Guardando" : "Registrar aumento"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
