import { useEffect } from "react";
import { Control, useWatch } from "react-hook-form";
import { CreditCard } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { FormSelect } from "@/shared/components/FormSelect";
import { FormInput } from "@/shared/components/FormInput";
import {
  useCreditTypes,
  useCreditEntities,
  useInsuranceEntities,
} from "../lib/purchaseRequestQuote.hook";

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

  const { data: creditTypes = [], isLoading: isLoadingCreditTypes } =
    useCreditTypes();

  // Las entidades de crédito se piden por el id (parent_id) del tipo de
  // crédito seleccionado, no por su código.
  const selectedCreditType = creditTypes.find(
    (master) => master.code === creditTypeWatch,
  );

  const { data: creditEntities = [], isLoading: isLoadingCreditEntities } =
    useCreditEntities(selectedCreditType?.id);

  const { data: insuranceEntities = [], isLoading: isLoadingInsuranceEntities } =
    useInsuranceEntities();

  const creditTypeOptions = creditTypes.map((master) => ({
    value: master.code,
    label: master.description,
  }));

  const creditEntityOptions = creditEntities.map((master) => ({
    value: master.code,
    label: master.description,
  }));

  const insuranceEntityOptions = insuranceEntities.map((master) => ({
    value: master.code,
    label: master.description,
  }));

  // Al cambiar el tipo de crédito, limpiar la entidad si ya no pertenece a las opciones disponibles
  useEffect(() => {
    if (
      creditEntityWatch &&
      !creditEntityOptions.some((opt) => opt.value === creditEntityWatch)
    ) {
      setValue("credit_entity", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditTypeWatch, creditEntities]);

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
        options={creditTypeOptions}
        control={control}
        strictFilter={true}
        isLoadingOptions={isLoadingCreditTypes}
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
        isLoadingOptions={isLoadingCreditEntities}
      />

      <FormSelect
        name="insurance_entity"
        label="Seguro Inchcape"
        placeholder="Sin seguro"
        options={insuranceEntityOptions}
        control={control}
        strictFilter={true}
        isLoadingOptions={isLoadingInsuranceEntities}
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
