import { useEffect, useRef } from "react";
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
  const creditTypeIdWatch = useWatch({ control, name: "credit_type_id" });
  const creditEntityIdWatch = useWatch({ control, name: "credit_entity_id" });

  const { data: creditTypes = [], isLoading: isLoadingCreditTypes } =
    useCreditTypes();

  // Las entidades de crédito se piden por el id (parent_id) del tipo de
  // crédito seleccionado.
  const { data: creditEntities = [], isLoading: isLoadingCreditEntities } =
    useCreditEntities(creditTypeIdWatch);

  const { data: insuranceEntities = [], isLoading: isLoadingInsuranceEntities } =
    useInsuranceEntities();

  const creditTypeOptions = creditTypes.map((master) => ({
    value: master.id.toString(),
    label: master.description,
  }));

  const creditEntityOptions = creditEntities.map((master) => ({
    value: master.id.toString(),
    label: master.description,
  }));

  const insuranceEntityOptions = insuranceEntities.map((master) => ({
    value: master.id.toString(),
    label: master.description,
  }));

  // Al cambiar el tipo de crédito, limpiar la entidad si ya no pertenece a las
  // opciones disponibles. Se ignora el primer render (y mientras las
  // entidades siguen cargando) para no borrar el valor precargado en modo
  // edición antes de que useCreditEntities termine de resolver.
  const previousCreditTypeIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (isLoadingCreditEntities) return;

    const typeChanged =
      previousCreditTypeIdRef.current !== undefined &&
      previousCreditTypeIdRef.current !== creditTypeIdWatch;
    previousCreditTypeIdRef.current = creditTypeIdWatch;

    if (
      typeChanged &&
      creditEntityIdWatch &&
      !creditEntityOptions.some((opt) => opt.value === creditEntityIdWatch)
    ) {
      setValue("credit_entity_id", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [creditTypeIdWatch, creditEntities, isLoadingCreditEntities]);

  return (
    <GroupFormSection
      title="Créditos, Seguros y GPS"
      icon={CreditCard}
      color="blue"
      cols={{ sm: 1, md: 2, lg: 4 }}
    >
      <FormSelect
        name="credit_type_id"
        label="Tipo de Crédito"
        placeholder="Sin crédito"
        options={creditTypeOptions}
        control={control}
        strictFilter={true}
        isLoadingOptions={isLoadingCreditTypes}
      />

      <FormSelect
        name="credit_entity_id"
        label="Entidad de Crédito"
        placeholder={
          creditTypeIdWatch
            ? "Selecciona una entidad"
            : "Selecciona un tipo primero"
        }
        options={creditEntityOptions}
        control={control}
        disabled={!creditTypeIdWatch}
        strictFilter={true}
        isLoadingOptions={isLoadingCreditEntities}
      />

      <FormSelect
        name="insurance_entity_id"
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
