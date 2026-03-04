import { UseFormReturn, useForm } from "react-hook-form";
import { useEffect } from "react";
import { Settings } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { ApBankResource } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";
import {
  PAYMENT_CONDITIONS,
  PAYMENT_CONDITION_CREDIT,
  CREDIT_DAYS_OPTIONS,
} from "../../lib/electronicDocument.constants";

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
}: AdditionalConfigSectionProps) {
  const medioDePago = form.watch("medio_de_pago");
  const condicionesDePago = form.watch("condiciones_de_pago");
  const isCredito = condicionesDePago === PAYMENT_CONDITION_CREDIT;

  // Form auxiliar solo para UI - los días de crédito no se envían al backend
  const creditDaysForm = useForm<{ credit_days: string }>({
    defaultValues: { credit_days: "" },
  });

  // Limpiar al cambiar a CONTADO
  useEffect(() => {
    if (!isCredito) {
      creditDaysForm.reset();
      form.setValue("venta_al_credito", []);
      form.setValue("fecha_de_vencimiento", undefined);
    }
  }, [isCredito, form, creditDaysForm]);

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

  // Filtrar chequeras: si medio de pago es EFECTIVO, solo mostrar las que contengan "CAJ"
  const filteredCheckbooks =
    medioDePago === "EFECTIVO"
      ? checkbooks.filter((checkbook) =>
          checkbook.code.toUpperCase().includes("CAJ"),
        )
      : checkbooks;

  const paymentMethodOptions = [
    {
      label: "EFECTIVO",
      value: "EFECTIVO",
    },
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
    {
      label: "OTRO",
      value: "OTRO",
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
    return option.label.includes(form.watch("condiciones_de_pago") || "");
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
        name="condiciones_de_pago"
        options={PAYMENT_CONDITIONS.map((o) => ({
          label: o.label,
          value: o.value,
        }))}
        placeholder="Seleccione una opción"
        description="Condiciones de pago del documento."
      />

      {isCredito && (
        <FormSelect
          control={creditDaysForm.control}
          label="Días de Crédito *"
          name="credit_days"
          options={CREDIT_DAYS_OPTIONS.map((o) => ({
            label: o.label,
            value: o.value,
          }))}
          placeholder="Seleccione los días"
          description="La fecha de vencimiento se calculará automáticamente."
          onValueChange={handleCreditDaysChange}
        />
      )}

      <FormSelect
        control={form.control}
        label="Medio de Pago *"
        name="medio_de_pago"
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

      <FormInput
        control={form.control}
        name="operation_number"
        label="Número de Operación"
        placeholder="Número de Operación"
        description="Número de operación asociada al pago."
      />

      {isModuleCommercial && (
        <FormSelect
          control={form.control}
          label="Tipo de Financiamiento"
          name="financing_type"
          options={filteredFinancingTypeOptions}
          placeholder="Seleccione una opción"
          description="Tipo de financiamiento del documento."
        />
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
