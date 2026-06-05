"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { updateLoanExtraDiscount } from "../lib/loan.actions";
import { errorToast, successToast } from "@/core/core.function";
import { LoanExtraDiscountResource } from "../lib/loan.interface";
import { requiredDecimalNumber } from "@/shared/lib/global.schema";

const editSchema = z.object({
  amount: requiredDecimalNumber("El monto es requerido"),
});

type EditSchema = z.infer<typeof editSchema>;

interface LoanEditDiscountDialogProps {
  discount: LoanExtraDiscountResource | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function LoanEditDiscountDialog({
  discount,
  open,
  onOpenChange,
  onSuccess,
}: LoanEditDiscountDialogProps) {
  const form = useForm<EditSchema>({
    resolver: zodResolver(editSchema) as any,
    defaultValues: { amount: "" as any },
    mode: "onChange",
  });

  useEffect(() => {
    if (discount) {
      form.reset({ amount: discount.amount as any });
    }
  }, [discount, form]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: EditSchema) =>
      updateLoanExtraDiscount(discount!.id, { amount: Number(data.amount) }),
    onSuccess: () => {
      successToast("Descuento actualizado correctamente.");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ?? "No se pudo actualizar el descuento.",
      );
    },
  });

  const handleClose = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Editar amortización"
      subtitle="Modifica el monto de la cuota antes de confirmarla."
      icon="Pencil"
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => mutate(data))}
          className="space-y-4"
        >
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
            <Button
              type="submit"
              disabled={isPending || !form.formState.isValid}
            >
              <Loader
                className={`mr-2 h-4 w-4 ${!isPending ? "hidden" : ""}`}
              />
              {isPending ? "Guardando..." : "Guardar cambios"}
            </Button>
          </div>
        </form>
      </Form>
    </GeneralModal>
  );
}
