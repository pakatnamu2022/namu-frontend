import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, Gauge, ImageIcon, Play } from "lucide-react";
import { PhotoCapture } from "@/components/photo-capture";
import { FormInput } from "@/shared/components/FormInput";
import { StopwatchDisplay } from "@/shared/components/StopWatchDisplay";
import { Control, FieldErrors } from "react-hook-form";
import { TravelControlModalData } from "../lib/travelControl.schema";
import { TravelControlResource } from "../lib/travelControl.interface";

interface RouteStartSectionProps {
  status: "pending" | "in_progress";
  control: Control<TravelControlModalData>;
  errors: FieldErrors<TravelControlModalData>;
  lastMileage: number | undefined;
  initialKmValue: string;
  handleInputChange: (
    field: keyof TravelControlModalData
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
  formSubmitting: boolean;
  isStartingRoute: boolean;
  startPhoto: string | null;
  setStartPhotoWithUpload: (photoUrl: string) => Promise<void>;
  isUploadingPhoto: boolean;
  startPhotoData: any;
  handleStartingRoute: () => Promise<void>;
  canStart: boolean | string;
  localTrip: TravelControlResource;
  getStartTime: () => Date | null;
  startStopwatch: {
    formattedTime: string;
    isRunning: boolean;
  };
}

export function RouteStartSection({
  status,
  control,
  errors,
  lastMileage,
  initialKmValue,
  handleInputChange,
  formSubmitting,
  isStartingRoute,
  startPhoto,
  setStartPhotoWithUpload,
  isUploadingPhoto,
  startPhotoData,
  handleStartingRoute,
  canStart,
  localTrip,
  getStartTime,
  startStopwatch,
}: RouteStartSectionProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h3 className="font-semibold flex items-center gap-2">
        <Play className="h-4 w-4 text-green-600" />
        {status === "pending" ? "Inicio de Ruta" : "Ruta en Progreso"}
      </h3>

      {status === "pending" ? (
        <div className="space-y-4">
          <FormInput
            control={control}
            name="initialKm"
            type="text"
            inputMode="decimal"
            label="Kilometraje Inicial *"
            placeholder={`Mínimo: ${lastMileage || 0} km`}
            addonStart={<Gauge className="h-4 w-4 text-gray-500" />}
            className="pl-10"
            disabled={formSubmitting || isStartingRoute}
            error={errors.initialKm?.message}
            onChange={handleInputChange("initialKm")}
          />
          {lastMileage && lastMileage > 0 && (
            <div className="text-xs text-gray-500 mt-1 space-y-1">
              <p>Último registro del vehículo: {lastMileage} km</p>
              {initialKmValue &&
                !errors.initialKm &&
                (() => {
                  const initial = parseFloat(initialKmValue);
                  if (!isNaN(initial) && initial >= lastMileage) {
                    return (
                      <div className="flex items-start gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mt-2">
                        <CheckCircle className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-green-700">
                            Cumple con el mínimo requerido
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            Último registro: {lastMileage} km • Ingresado: {initial} km
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
            </div>
          )}

          <PhotoCapture
            onPhotoCapture={setStartPhotoWithUpload}
            capturedPhoto={startPhoto}
            label="Foto de Inicio"
            variant="start"
            disabled={isUploadingPhoto || formSubmitting || isStartingRoute}
          />
          {startPhotoData && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm font-medium text-green-700 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Foto lista para iniciar ruta
              </p>
              <p className="text-xs text-green-600 mt-1">
                ID: {startPhotoData.id} • {startPhotoData.formattedDate}
              </p>
            </div>
          )}

          <Button
            onClick={() => handleStartingRoute()}
            disabled={!canStart || isUploadingPhoto || !!errors.initialKm}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isStartingRoute ? (
              <>
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Procesando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar Ruta
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Clock className="h-5 w-5 text-green-600" />
            <div>
              <p className="font-medium">Ruta iniciada</p>
              <p className="text-sm text-gray-600">
                {getStartTime()
                  ? new Date(getStartTime()!).toLocaleString("es-PE")
                  : "N/A"}{" "}
                • {localTrip.initialKm} km
              </p>
            </div>
          </div>
          {startPhoto && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-success" />
                Foto de Inicio
              </p>
              <img
                src={startPhoto}
                alt="Foto de Inicio"
                className="w-full h-32 object-cover rounded-lg border border-success/30"
              />
            </div>
          )}
          <StopwatchDisplay
            time={startStopwatch.formattedTime}
            label="Tiempo en ruta"
            variant="start"
            isRunning={startStopwatch.isRunning}
          />
        </div>
      )}
    </div>
  );
}
