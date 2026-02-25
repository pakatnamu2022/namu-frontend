"use client";

import { ShipmentsReceptionsForm } from "../../envios-recepciones/components/ShipmentsReceptionsForm";
import { CONTROL_UNITS } from "../lib/controlUnits.constants";
import { ControlUnitsSchema } from "../lib/controlUnits.schema";

interface ControlUnitsFormProps {
  defaultValues: Partial<ControlUnitsSchema> & {
    transmitter_establishment?: any;
    receiver_establishment?: any;
  };
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  mode?: "create" | "update";
  onCancel?: () => void;
  isLoadingData?: boolean;
}

export const ControlUnitsForm = (props: ControlUnitsFormProps) => {
  return (
    <ShipmentsReceptionsForm
      {...props}
      isConsignment={true}
      cancelRoute={CONTROL_UNITS.ABSOLUTE_ROUTE}
    />
  );
};
