import { useEffect } from "react";
import { Control, useWatch } from "react-hook-form";
import { CreditCard } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import {
  CREDIT_TYPE_OPTIONS,
  CREDIT_ENTITIES_BY_TYPE,
  INSURANCE_ENTITY_OPTIONS,
} from "../lib/purchaseRequestQuote.constants";

interface CreditInsuranceGpsSectionProps {
  control: Control<any>;
  setValue: (name: string, value: any) => void;
}

export const CreditInsuranceGpsSection = ({
  control,
  setValue,
}: CreditInsuranceGpsSectionProps) => {
  const creditTypeWatch = useWatch({ control, name: "credit_type" });
  const creditEntityWatch = useWatch({ control, name: "credit_entity" });

  const creditEntityOptions = (
    CREDIT_ENTITIES_BY_TYPE[creditTypeWatch] ?? []
  ).map((entity) => ({ value: entity, label: entity }));

  // Al cambiar el tipo de crédito, limpiar la entidad si ya no pertenece a las opciones disponibles
  useEffect(() => {
    if (
      creditEntityWatch &&
      !CREDIT_ENTITIES_BY_TYPE[creditTypeWatch]?.includes(creditEntityWatch)
    ) {
      setValue("credit_entity", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditTypeWatch]);

  return (
    <GroupFormSection
      title="Créditos, Seguros y GPS"
      icon={CreditCard}
      color="blue"
      cols={{ sm: 1, md: 2, lg: 4 }}
    >
      <FormSelect
        name="credit_type"
        label="Tipo de Crédito"
        placeholder="Sin crédito"
        options={CREDIT_TYPE_OPTIONS.map((opt) => ({
          value: opt.value,
          label: opt.label,
        }))}
        control={control}
        strictFilter={true}
      />

      <FormSelect
        name="credit_entity"
        label="Entidad de Crédito"
        placeholder={
          creditTypeWatch ? "Selecciona una entidad" : "Selecciona un tipo primero"
        }
        options={creditEntityOptions}
        control={control}
        disabled={!creditTypeWatch}
        strictFilter={true}
      />

      <FormSelect
        name="insurance_entity"
        label="Seguro Inchcape"
        placeholder="Sin seguro"
        options={INSURANCE_ENTITY_OPTIONS.map((entity) => ({
          value: entity,
          label: entity,
        }))}
        control={control}
        strictFilter={true}
      />

      <FormInput
        control={control}
        name="gps_hunter_years"
        label="GPS Hunter (años)"
        type="number"
        min={1}
        step={1}
        inputMode="numeric"
        placeholder="Sin GPS Hunter"
      />
    </GroupFormSection>
  );
};
