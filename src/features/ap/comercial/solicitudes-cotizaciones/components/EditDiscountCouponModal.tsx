"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Loader, Info } from "lucide-react";
import { toast } from "sonner";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FormInput } from "@/shared/components/FormInput";
import { FormSwitch } from "@/shared/components/FormSwitch";
import { NumberFormat } from "@/shared/components/NumberFormat";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import {
  useAllConceptDiscountBond,
  useConceptDiscountBondDescriptions,
  useUpdateDiscountCoupon,
} from "../lib/purchaseRequestQuote.hook";
import { BonusDiscountResource } from "../lib/purchaseRequestQuote.interface";
import { Option } from "@/core/core.interface";

const DEDUCCION_7_FACTOR = 0.93;

interface EditDiscountCouponFormValues {
  concept_id: string;
  value: number | "";
  has_retention: boolean;
}

interface EditDiscountCouponModalProps {
  open: boolean;
  onClose: () => void;
  coupon: BonusDiscountResource | null;
  currencySymbol?: string;
}

export function EditDiscountCouponModal({
  open,
  onClose,
  coupon,
  currencySymbol = "",
}: EditDiscountCouponModalProps) {
  const { data: conceptsOptions = [] } = useAllConceptDiscountBond();

  const form = useForm<EditDiscountCouponFormValues>({
    defaultValues: {
      concept_id: "",
      value: "",
      has_retention: false,
    },
  });

  useEffect(() => {
    if (open && coupon) {
      form.reset({
        concept_id: coupon.concept_code_id.toString(),
        value: "",
        has_retention: !!coupon.has_retention,
      });
    }
  }, [open, coupon]);

  const { mutate: updateCoupon, isPending } = useUpdateDiscountCoupon();

  const value = form.watch("value");
  const hasRetention = form.watch("has_retention");
  const conceptId = form.watch("concept_id");

  // Padre del concepto (861/862). Si es null, el concepto no tiene hermanos
  // y no se muestra el selector de "Descripción".
  const parentConceptId = coupon?.concept_code_parent_id ?? undefined;
  const { data: bondDescriptions = [] } = useConceptDiscountBondDescriptions(
    parentConceptId,
  );

  const rootConceptLabel = parentConceptId
    ? conceptsOptions.find((o) => o.id === parentConceptId)?.description
    : coupon?.concept_code;

  const numericValue = value === "" ? null : Number(value);
  const netAmount =
    numericValue != null && !Number.isNaN(numericValue)
      ? hasRetention
        ? Math.round(numericValue * DEDUCCION_7_FACTOR * 100) / 100
        : numericValue
      : null;

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = (values: EditDiscountCouponFormValues) => {
    if (!coupon) return;
    updateCoupon(
      {
        id: coupon.id,
        data: {
          has_retention: values.has_retention,
          ...(bondDescriptions.length > 0 && values.concept_id
            ? { concept_id: Number(values.concept_id) }
            : {}),
          ...(values.value !== "" ? { value: Number(values.value) } : {}),
        },
      },
      {
        onSuccess: () => {
          toast.success("Bono actualizado correctamente");
          handleClose();
        },
        onError: () => {
          toast.error("Error al actualizar el bono");
        },
      },
    );
  };

  return (
    <GeneralModal
      open={open}
      onClose={handleClose}
      title="Editar Bono"
      subtitle="Cotización facturada · el monto se recalculará al guardar"
      icon="Edit2"
      size="lg"
    >
      {coupon && (
        <Form {...form}>
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 px-3 py-2 text-sm">
              <p className="text-xs text-muted-foreground">Monto actual</p>
              <p className="font-medium">
                {currencySymbol} <NumberFormat value={Number(coupon.amount)} />
              </p>
            </div>

            <SearchableSelect
              options={
                rootConceptLabel
                  ? [
                      {
                        value: (parentConceptId ?? coupon.concept_code_id).toString(),
                        label: rootConceptLabel,
                      },
                    ]
                  : []
              }
              value={(parentConceptId ?? coupon.concept_code_id).toString()}
              onChange={() => {}}
              label="Tipo de bono"
              disabled
              allowClear={false}
              buttonSize="default"
            />

            {bondDescriptions.length > 0 && (
              <SearchableSelect
                options={bondDescriptions.map(
                  (o): Option => ({ value: o.id.toString(), label: o.description }),
                )}
                value={conceptId}
                onChange={(value) =>
                  form.setValue("concept_id", value, {
                    shouldDirty: true,
                  })
                }
                label="Descripción"
                placeholder="Selecciona una descripción"
                allowClear={false}
                buttonSize="default"
              />
            )}

            <FormInput
              name="value"
              label="Nuevo valor (bruto)"
              control={form.control}
              type="number"
              step="0.01"
              placeholder="Dejar vacío para mantener el valor actual"
            />

            <FormSwitch
              control={form.control}
              name="has_retention"
              text="Aplica retención 7%"
              textDescription="El monto se guardará neto, reducido en 7% (x0.93)"
              autoHeight
            />

            {netAmount != null && (
              <Alert variant="info">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium mb-1">Vista Previa</p>
                  <p className="text-sm">
                    Quedará registrado con {currencySymbol}{" "}
                    <NumberFormat value={netAmount} />
                    {hasRetention && (
                      <span className="text-muted-foreground">
                        {" "}
                        (bruto {currencySymbol}{" "}
                        <NumberFormat value={numericValue!} /> − 7%)
                      </span>
                    )}
                  </p>
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                disabled={isPending}
                onClick={form.handleSubmit(handleSubmit)}
                className="flex-1"
              >
                {isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
                {isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </div>
        </Form>
      )}
    </GeneralModal>
  );
}
