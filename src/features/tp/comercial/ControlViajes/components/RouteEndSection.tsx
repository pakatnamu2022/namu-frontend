import { Button } from "@/components/ui/button";
import { CheckCircle, Gauge, Package, Square } from "lucide-react";
import { PhotoCapture } from "@/components/photo-capture";
import { FormInput } from "@/shared/components/FormInput";
import { Control, FieldErrors } from "react-hook-form";
import { TravelControlModalData } from "../lib/travelControl.schema";
import { TravelControlResource } from "../lib/travelControl.interface";

interface RouteEndSectionProps {
  control: Control<TravelControlModalData>;
  errors: FieldErrors<TravelControlModalData>;
  finalKmValue: string;
  handleInputChange: (
    field: keyof TravelControlModalData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  formSubmitting: boolean;
  isEndingRoute: boolean;
  localTrip: TravelControlResource;
  endPhoto: string | null;
  setEndPhotoWithUpload: (photoUrl: string) => Promise<void>;
  endPhotoData: any;
  handleFinalizeRoute: () => Promise<void | false>;
  canEnd: boolean | string;
  isUploadingPhoto: boolean;
}

export function RouteEndSection({
  control,
  errors,
  finalKmValue,
  handleInputChange,
  formSubmitting,
  isEndingRoute,
  localTrip,
  endPhoto,
  setEndPhotoWithUpload,
  endPhotoData,
  handleFinalizeRoute,
  canEnd,
  isUploadingPhoto,
}: RouteEndSectionProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold flex items-center gap-2">
        <Square className="h-4 w-4 text-blue-600" />
        Fin de Ruta
      </h3>

      <div className="space-y-4">
        <div className="space-y-2">
          <FormInput
            control={control}
            name="finalKm"
            label="Kilometraje Final*"
            type="text"
            inputMode="decimal"
            placeholder={`Debe ser mayor a: ${localTrip?.initialKm || 0} km`}
            addonStart={<Gauge className="h-4 w-4 text-gray-500" />}
            className="pl-10"
            disabled={formSubmitting || isEndingRoute}
            error={errors.finalKm?.message}
            onChange={handleInputChange("finalKm")}
          />

          {finalKmValue &&
            !errors.finalKm &&
            localTrip?.initialKm &&
            (() => {
              const final = parseFloat(finalKmValue);
              const initial = localTrip.initialKm;
              if (!isNaN(final) && final > initial) {
                return (
                  <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-700">
                        Correcto: {final - initial} km recorridos
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Desde {initial} km hasta {final} km
                      </p>
                    </div>
                  </div>
                );
              }
              return null;
            })()}
        </div>

        <FormInput
          control={control}
          name="tonnage"
          label="Toneladas Transportadas (optional)"
          type="text"
          inputMode="decimal"
          placeholder="Ej: 25"
          value="0"
          addonStart={<Package className="h-4 w-4 text-gray-500" />}
          className="pl-10"
          disabled={formSubmitting || isEndingRoute}
          error={errors.tonnage?.message}
          onChange={handleInputChange("tonnage")}
        />

        <PhotoCapture
          onPhotoCapture={setEndPhotoWithUpload}
          capturedPhoto={endPhoto}
          label="Foto de Finalizacion"
          variant="end"
          disabled={formSubmitting || isEndingRoute}
        />

        {endPhotoData && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm font-medium text-blue-700 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Foto lista para finalizar ruta
            </p>
            <p className="text-xs text-blue-600 mt-1">
              ID: {endPhotoData.id} • {endPhotoData.formattedDate}
            </p>
          </div>
        )}

        <Button
          onClick={() => handleFinalizeRoute()}
          disabled={!canEnd || isUploadingPhoto || isEndingRoute}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {isEndingRoute ? (
            <>
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
              Procesando...
            </>
          ) : (
            <>
              <Square className="h-4 w-4 mr-2" />
              Finalizar Ruta
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
