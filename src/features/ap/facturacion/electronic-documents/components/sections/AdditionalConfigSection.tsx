import { UseFormReturn } from "react-hook-form";
import { Settings } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { ElectronicDocumentSchema } from "../../lib/electronicDocument.schema";
import { FormSelect } from "@/shared/components/FormSelect";
import { ApBankResource } from "@/features/ap/configuraciones/maestros-general/chequeras/lib/apBank.interface";
import { FormInput } from "@/shared/components/FormInput";
import { FormTextArea } from "@/shared/components/FormTextArea";

interface AdditionalConfigSectionProps {
  form: UseFormReturn<ElectronicDocumentSchema>;
  checkbooks: ApBankResource[];
  isModuleCommercial?: boolean;
}

export function AdditionalConfigSection({
  form,
  checkbooks,
  isModuleCommercial = true,
}: AdditionalConfigSectionProps) {
  const medioDePago = form.watch("medio_de_pago");

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
      iconColor="text-primary"
      bgColor="bg-primary/5"
      cols={{ sm: 1, md: 3 }}
    >
      <FormSelect
        control={form.control}
        label="Condiciones de Pago *"
        name="condiciones_de_pago"
        options={[
          {
            label: "CONTADO",
            value: "CONTADO",
          },
          {
            label: "CREDITO",
            value: "CREDITO",
          },
        ]}
        placeholder="Seleccione una opción"
        description="Condiciones de pago del documento."
      />

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
