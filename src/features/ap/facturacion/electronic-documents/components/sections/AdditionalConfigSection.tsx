import { UseFormReturn, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { Settings } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormCombobox } from "@/shared/components/FormCombobox";
import { ApBankResource } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import {
  PAYMENT_CONDITIONS,
  PAYMENT_CONDITION_CREDIT,
  CREDIT_DAYS_OPTIONS,
} from "../../lib/electronicDocument.constants";
import z from "zod";

interface AdditionalConfigSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  checkbooks: ApBankResource[];
  isModuleCommercial?: boolean;
  useQuotation?: boolean;
}

export function AdditionalConfigSection({
  form,
  checkbooks,
  isModuleCommercial = true,
  useQuotation = false,
}: AdditionalConfigSectionProps) {
  const medioDePago = form.watch("medio_de_pago");
  const condicionesDePago = form.watch("condiciones_de_pago");
  const isCredito = medioDePago === PAYMENT_CONDITION_CREDIT;

  // Form auxiliar solo para UI - los días de crédito no se envían al backend
  const creditDaysSchema = z.object({
    credit_days: z
      .string()
      .min(1, "Requerido")
      .refine((val) => Number.isInteger(Number(val)) && Number(val) > 0, {
        message: "Debe ser un número entero positivo",
      }),
  });
  const creditDaysForm = useForm<{ credit_days: string }>({
    resolver: zodResolver(creditDaysSchema),
    defaultValues: { credit_days: "" },
    mode: "onChange",
  });

  // Limpiar al cambiar a CONTADO; poner 30 días por defecto al cambiar a CREDITO
  useEffect(() => {
    if (!isCredito) {
      creditDaysForm.reset();
      form.setValue("venta_al_credito", []);
      form.setValue("fecha_de_vencimiento", undefined);
    } else {
      creditDaysForm.setValue("credit_days", "30");
    }
  }, [isCredito, form, creditDaysForm]);

  // Recalcular fecha de vencimiento cuando cambian los días de crédito
  const creditDaysValue = creditDaysForm.watch("credit_days");
  useEffect(() => {
    if (creditDaysValue) {
      handleCreditDaysChange(creditDaysValue);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditDaysValue]);

  function handleCreditDaysChange(days: string) {
    const fechaEmision = form.getValues("fecha_de_emision");
    const total = form.getValues("total");
    if (!fechaEmision) return;

    const fechaPago = new Date(fechaEmision);
    fechaPago.setDate(fechaPago.getDate() + Number(days));
    const dd = String(fechaPago.getDate()).padStart(2, "0");
    const mm = String(fechaPago.getMonth() + 1).padStart(2, "0");
    const yyyy = fechaPago.getFullYear();
    const fechaFormateada = `${dd}-${mm}-${yyyy}`;

    // Setear la fecha de vencimiento calculada en el form principal
    form.setValue("fecha_de_vencimiento", `${yyyy}-${mm}-${dd}`);

    form.setValue("venta_al_credito", [
      { cuota: 1, fecha_de_pago: fechaFormateada, importe: total ?? 0 },
    ]);
  }

  // Filtrar chequeras: si condiciones de pago es EFECTIVO, solo mostrar las que contengan "CAJ"
  const filteredCheckbooks =
    condicionesDePago === "EFECTIVO"
      ? checkbooks.filter((checkbook) =>
          checkbook.code.toUpperCase().includes("CAJ01"),
        )
      : condicionesDePago !== "EFECTIVO"
        ? checkbooks.filter(
            (checkbook) => !checkbook.code.toUpperCase().includes("CAJ"),
          )
        : checkbooks;

  const paymentMethodOptions = [
    ...(!isModuleCommercial ? [{ label: "EFECTIVO", value: "EFECTIVO" }] : []),
    {
      label: "TARJETA",
      value: "TARJETA",
    },
    {
      label: "TRANSFERENCIA BANCARIA",
      value: "TRANSFERENCIA BANCARIA",
    },
    {
      label: "DEPÓSITO BANCARIO",
      value: "DEPOSITO BANCARIO",
    },
  ];

  const financingTypeOptions = [
    {
      label: "CREDITO POR CONVENIO",
      value: "CONVENIO",
    },
    {
      label: "CREDITO VEHICULAR",
      value: "VEHICULAR",
    },
    {
      label: "CONTADO",
      value: "CONTADO",
    },
  ];

  const filteredFinancingTypeOptions = financingTypeOptions.filter((option) => {
    return option.label.includes(form.watch("medio_de_pago")?.toUpperCase() || "");
  });

  return (
    <GroupFormSection
      title="Configuración Adicional"
      icon={Settings}
      color="primary"
      cols={{ sm: 1, md: 3 }}
    >
      <FormSelect
        control={form.control}
        label="Condiciones de Pago *"
        name="medio_de_pago"
        options={PAYMENT_CONDITIONS.map((o) => ({
          label: o.label,
          value: o.value,
        }))}
        placeholder="Seleccione una opción"
        description="Condiciones de pago del documento."
      />

      {isCredito ? (
        <>
          <FormCombobox
            control={creditDaysForm.control}
            label="Días de Crédito *"
            name="credit_days"
            options={CREDIT_DAYS_OPTIONS.map((o) => ({
              label: o.label,
              value: o.value,
            }))}
            placeholder="Seleccione los días"
            description="La fecha de vencimiento se calculará automáticamente."
            validateCreate={(val) => /^\d+$/.test(val)}
          />
          {useQuotation && (
            <FormSelect
              control={form.control}
              label="Tipo de Financiamiento *"
              name="financing_type"
              options={filteredFinancingTypeOptions}
              placeholder="Seleccione una opción"
              description="Tipo de financiamiento del documento."
              required
            />
          )}
        </>
      ) : (
        <>
          <FormSelect
            control={form.control}
            label="Medio de Pago *"
            name="condiciones_de_pago"
            options={paymentMethodOptions}
            placeholder="Seleccione una opción"
            description="Medio de pago utilizado en el documento."
          />

          <FormSelect
            control={form.control}
            label="Entidad"
            name="bank_id"
            options={filteredCheckbooks.map((checkbook) => ({
              label: checkbook.code,
              value: String(checkbook.id),
              description: checkbook.account_number,
            }))}
            placeholder="Seleccione una opción"
            description="Chequera asociada al medio de pago."
          />

          {condicionesDePago !== "EFECTIVO" && (
            <FormInput
              control={form.control}
              name="operation_number"
              label="Número de Operación"
              placeholder="Número de Operación"
              description="Número de operación asociada al pago."
            />
          )}

          {useQuotation && (
            <FormSelect
              control={form.control}
              label="Tipo de Financiamiento"
              name="financing_type"
              options={filteredFinancingTypeOptions}
              placeholder="Seleccione una opción"
              description="Tipo de financiamiento del documento."
              required
            />
          )}
        </>
      )}

      <div className="col-span-full">
        <FormTextArea
          control={form.control}
          name="observaciones"
          label="Observaciones"
          placeholder="Observaciones adicionales..."
          description="Información adicional que se mostrará en el documento."
        />
      </div>
    </GroupFormSection>
  );
}
