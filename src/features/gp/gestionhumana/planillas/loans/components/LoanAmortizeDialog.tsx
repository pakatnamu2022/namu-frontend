"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { FormSelectAsync } from "@/shared/components/FormSelectAsync";
import { DatePickerFormField } from "@/shared/components/DatePickerFormField";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { storeLoanExtraDiscount } from "../lib/loan.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { LOAN } from "../lib/loan.constant";
import { useGeneralMasters } from "@/features/gp/maestros-generales/lib/generalMasters.hook";
import { DISCOUNTS_BENEFITS_TYPE } from "@/features/gp/maestros-generales/lib/generalMasters.constants";
import {
  requiredDecimalNumber,
  requiredStringId,
} from "@/shared/lib/global.schema";

const amortizeSchema = z.object({
  concept_type_id: requiredStringId("El concepto es requerido"),
  amount: requiredDecimalNumber("El monto es requerido"),
  scheduled_date: z.string().optional(),
  concept_month: z.number().nullable().optional(),
});

type AmortizeSchema = z.infer<typeof amortizeSchema>;

interface LoanAmortizeDialogProps {
  loanId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const useDiscountBenefitConcepts = (params: Record<string, any>) =>
  useGeneralMasters({
    params: { ...params, type: DISCOUNTS_BENEFITS_TYPE },
  });

export function LoanAmortizeDialog({
  loanId,
  open,
  onOpenChange,
  onSuccess,
}: LoanAmortizeDialogProps) {
  const { MODEL } = LOAN;

  const form = useForm<AmortizeSchema>({
    resolver: zodResolver(amortizeSchema) as any,
    defaultValues: {
      concept_type_id: undefined,
      amount: "" as any,
      scheduled_date: undefined,
      concept_month: null,
    },
    mode: "onChange",
  });

  const conceptMonth = useWatch({
    control: form.control,
    name: "concept_month",
  });
  const scheduledDate = useWatch({
    control: form.control,
    name: "scheduled_date",
  });

  // null → no se eligió concepto, 0 → libre, 1-12 → mes específico
  const showDatePicker = conceptMonth !== null && conceptMonth !== undefined;
  const isFreeDate = conceptMonth === 0;
  const currentYear = new Date().getFullYear();

  const { startMonth, endMonth, disabledRange } = useMemo(() => {
    if (!showDatePicker || isFreeDate) {
      return {
        startMonth: undefined,
        endMonth: undefined,
        disabledRange: undefined,
      };
    }

    const monthIndex = (conceptMonth as number) - 1; // 0-based
    const first = new Date(currentYear, monthIndex, 1);
    const last = new Date(currentYear, monthIndex + 1, 0);

    return {
      startMonth: first,
      endMonth: last,
      // Deshabilita cualquier día fuera del mes seleccionado
      disabledRange: (date: Date) =>
        date.getMonth() !== monthIndex || date.getFullYear() !== currentYear,
    };
  }, [showDatePicker, isFreeDate, conceptMonth, currentYear]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: AmortizeSchema) =>
      storeLoanExtraDiscount({
        loan_id: loanId,
        concept_type_id: String(data.concept_type_id),
        amount: Number(data.amount),
        ...(showDatePicker && data.scheduled_date
          ? { scheduled_date: data.scheduled_date }
          : {}),
      }),
    onSuccess: () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      form.reset();
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
    },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  const isFormValid =
    form.formState.isValid && (!showDatePicker || !!scheduledDate);

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Amortizar deuda"
      subtitle="Registra un pago adicional para amortizar el préstamo."
      icon="Banknote"
      size="md"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) =>
            mutate(data as unknown as AmortizeSchema),
          )}
          className="space-y-4"
        >
          <FormSelectAsync
            name="concept_type_id"
            label="Concepto"
            placeholder="Seleccione concepto"
            control={form.control}
            required
            useQueryHook={useDiscountBenefitConcepts}
            mapOptionFn={(item) => ({
              label: item.description,
              value: String(item.id),
            })}
            onValueChange={(_value, item) => {
              const monthNum =
                item?.value !== undefined ? Number(item.value) : null;
              form.setValue(
                "concept_month",
                !isNaN(monthNum as number) && monthNum !== null
                  ? monthNum
                  : null,
              );
              form.setValue("scheduled_date", undefined);
            }}
          />

          {showDatePicker && (
            <DatePickerFormField
              name="scheduled_date"
              label="Fecha programada"
              placeholder="Seleccione un día"
              control={form.control as any}
              disabledRange={disabledRange}
              startMonth={startMonth}
              endMonth={endMonth}
            />
          )}

          <FormInput
            name="amount"
            label="Monto"
            placeholder="Ej: 500.00"
            control={form.control}
            required
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !isFormValid}>
              <Loader
                className={`mr-2 h-4 w-4 ${!isPending ? "hidden" : ""}`}
              />
              {isPending ? "Guardando..." : "Registrar pago"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
