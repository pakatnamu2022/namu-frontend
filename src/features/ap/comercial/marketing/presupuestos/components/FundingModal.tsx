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
import { useAllCurrencyTypes } from "@/features/ap/configuraciones/maestros-general/tipos-moneda/lib/CurrencyTypes.hook";
import {
  ERROR_MESSAGE,
  errorToast,
  successToast,
} from "@/core/core.function";
import { addFundingToBudget } from "../lib/budgets.actions";
import { FundingSchema, fundingSchema } from "../lib/budgets.schema";
import { FUNDING_SOURCE_OPTIONS } from "../lib/budgets.constants";

interface Props {
  budgetId: number | null;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function FundingModal({ budgetId, onOpenChange, onSuccess }: Props) {
  const { data: currencies = [] } = useAllCurrencyTypes();
  const form = useForm({
    resolver: zodResolver(fundingSchema),
    defaultValues: { source: "AP", currency_id: "", amount: 0, notes: "" },
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (data: FundingSchema) => addFundingToBudget(budgetId!, data),
    onSuccess: () => {
      successToast("Financiamiento agregado correctamente");
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE({ name: "Financiamiento", gender: true }, "create", msg));
    },
  });

  return (
    <Dialog open={budgetId !== null} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Financiamiento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => mutate(data))} className="space-y-4">
            <FormSelect
              name="source"
              label="Origen"
              placeholder="Selecciona un origen"
              options={FUNDING_SOURCE_OPTIONS}
              control={form.control}
              required
            />
            <FormSelect
              name="currency_id"
              label="Moneda"
              placeholder="Selecciona una moneda"
              options={currencies.map((c) => ({ label: `${c.name} (${c.symbol})`, value: c.id.toString() }))}
              control={form.control}
              required
            />
            <FormInput
              name="amount"
              label="Monto"
              type="number"
              step="0.01"
              control={form.control}
              required
            />
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
