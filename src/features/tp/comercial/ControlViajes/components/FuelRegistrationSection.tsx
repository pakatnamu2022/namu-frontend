import { Button } from "@/components/ui/button";
import { Fuel } from "lucide-react";
import { FormInput } from "@/shared/components/FormInput";
import { Control, FieldErrors } from "react-hook-form";
import { TravelControlModalData } from "../lib/travelControl.schema";
import { TravelControlResource } from "../lib/travelControl.interface";

interface FuelRegistrationSectionProps {
  control: Control<TravelControlModalData>;
  errors: FieldErrors<TravelControlModalData>;
  factorKmValue: string;
  handleInputChange: (
    field: keyof TravelControlModalData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  formSubmitting: boolean;
  isRegisteringFuel: boolean;
  localTrip: TravelControlResource;
  handleSavingFuel: () => Promise<void>;
}

export function FuelRegistrationSection({
  control,
  errors,
  factorKmValue,
  handleInputChange,
  formSubmitting,
  isRegisteringFuel,
  localTrip,
  handleSavingFuel,
}: FuelRegistrationSectionProps) {
  return (
    <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
      <h3 className="font-semibold flex items-center gap-2">
        <Fuel className="h-4 w-4 text-orange-600" />
        Registro de Combustible
      </h3>

      <FormInput
        control={control}
        name="factorKm"
        label="Factor Kilómetro (S/. por km) *"
        type="text"
        inputMode="decimal"
        placeholder="Ej: 1.8"
        error={errors.factorKm?.message}
        disabled={formSubmitting || isRegisteringFuel}
        onChange={handleInputChange("factorKm")}
      />

      {factorKmValue && localTrip.totalKm && (
        <div className="p-4 bg-white rounded-lg border">
          <p className="text-sm text-gray-600">Monto Calculado</p>
          <p className="text-2xl font-bold">
            S/{" "}
            {(parseFloat(factorKmValue) * (localTrip.totalKm || 0)).toFixed(2)}
          </p>
        </div>
      )}

      <Button
        onClick={() => handleSavingFuel()}
        color="orange"
        disabled={!factorKmValue || !!errors.factorKm || isRegisteringFuel}
        className="w-full"
      >
        {isRegisteringFuel ? (
          <>
            <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
            Procesando...
          </>
        ) : (
          <>
            <Fuel className="h-4 w-4 mr-2" />
            Guardar Combustible
          </>
        )}
      </Button>
    </div>
  );
}
