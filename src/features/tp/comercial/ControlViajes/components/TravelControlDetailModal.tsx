"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Form } from "@/components/ui/form";
import {
  TravelControlDetailModalProps,
  TravelControlResource,
} from "../lib/travelControl.interface";
import { useStopwatch } from "@/shared/hooks/useStopwatch";
import { StopwatchDisplay } from "@/shared/components/StopWatchDisplay";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import {
  uploadPhoto,
  getCurrentLocation,
  parseUserAgent,
} from "../lib/travelPhoto.actions";
import {
  useEndRoute,
  useLastMileage,
  useRegisterFuel,
  useStartRoute,
} from "../lib/travelControl.hooks";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTravelControlModalSchema,
  TravelControlModalData,
} from "../lib/travelControl.schema";
import { TripStatusBadge } from "./TripStatusBadge";
import { TripInfoSection } from "./TripInfoSection";
import { RouteStartSection } from "./RouteStartSection";
import { RouteEndSection } from "./RouteEndSection";
import { FuelRegistrationSection } from "./FuelRegistrationSection";
import { TripMetricsSection } from "./TripMetricsSection";
import { PhotoEvidenceSection } from "./PhotoEvidenceSection";
import { TravelPhoto } from "../lib/travelPhoto.interface";
import {
  errorToast,
  infoToast,
  successToast,
  warningToast,
} from "@/core/core.function";

export function TravelControlDetailModal({
  trip,
  trigger,
  onStatusChange,
}: TravelControlDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [localTrip, setLocalTrip] = useState<TravelControlResource | null>(
    trip,
  );
  const { user } = useAuthStore();
  const { data: userComplete } = useUserComplete(user.id);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [startPhoto, setStartPhoto] = useState<string | null>(null);
  const [endPhoto, setEndPhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [startPhotoData, setStartPhotoData] = useState<TravelPhoto | null>(
    null,
  );
  const [endPhotoData, setEndPhotoData] = useState<TravelPhoto | null>(null);
  const { data: lastMileage } = useLastMileage(
    localTrip?.tracto_id ? String(localTrip.tracto_id) : undefined,
  );

  const travelSchema = useMemo(() => {
    return createTravelControlModalSchema({
      lastMileage: lastMileage ?? undefined,
      tripInitialKm: localTrip?.initialKm ?? undefined,
    });
  }, [lastMileage, localTrip?.initialKm]);

  const form = useForm<TravelControlModalData>({
    resolver: zodResolver(travelSchema),
    defaultValues: {
      initialKm: "",
      finalKm: "",
      tonnage: "",
      factorKm: "",
      fuelGallons: "",
      fuelAmount: "",
      documentNumber: "",
      vatNumber: "",
    },
    mode: "onChange",
  });

  const {
    control,
    formState: { errors, isSubmitting: formSubmitting },
    reset,
    setValue,
    watch,
    getValues,
    trigger: triggerValidation,
  } = form;

  const { mutateAsync: startRouteMutation, isPending: isStartingRoute } =
    useStartRoute();
  const { mutateAsync: endRouteMutation, isPending: isEndingRoute } =
    useEndRoute();
  const { mutateAsync: registerFuelMutation, isPending: isRegisteringFuel } =
    useRegisterFuel();

  const initialKmValue = watch("initialKm");
  const finalKmValue = watch("finalKm");
  const tonnageValue = watch("tonnage");
  const factorKmValue = watch("factorKm");

  const getStartTime = (): Date | null => {
    if (!localTrip) return null;
    const startRecord = localTrip?.driver_records?.find(
      (register) => register?.record_type === "start",
    );
    const dateString = startRecord?.recorded_at || localTrip.startTime || null;
    if (!dateString) return null;
    try {
      return new Date(dateString);
    } catch (error) {
      console.error("Error parsing date:", error);
      return null;
    }
  };

  const handleStartingRoute = async () => {
    const isValid = await triggerValidation(["initialKm"]);

    if (!isValid) {
      warningToast("Por favor, corrige el kilometraje inicial");
      return;
    }

    if (!startPhoto) {
      warningToast("Por favor, capture una foto antes de iniciar la ruta.");
      return;
    }

    const formData = getValues();
    await handleStartRoute(formData);
  };

  const handleSavingFuel = async () => {
    const isValid = await triggerValidation("factorKm");

    if (!isValid) {
      warningToast(
        errors.factorKm?.message || "Por favor, corrige el factor KM",
      );
      return;
    }

    const formData = getValues();
    await handleSaveFuel(formData);
  };

  const handleFinalizeRoute = async () => {
    const isValid = await triggerValidation(["finalKm"]);

    if (!isValid) {
      warningToast("Por favor, corrige los errores en el formulario");
      return;
    }

    if (!endPhoto) {
      warningToast("Por favor, capture una foto antes de finalizar la ruta.");
      return false;
    }

    const formData = getValues();
    await handleEndRoute(formData);
  };

  const startStopwatch = useStopwatch(getStartTime());
  const endStopwatch = useStopwatch(endTime);

  const handlePhotoCapture = async (
    photoUrl: string,
    photoType: "start" | "end",
    action: "start" | "end",
  ) => {
    if (!localTrip) {
      errorToast("No hay viaje seleccionado");
      return;
    }

    try {
      setIsUploadingPhoto(true);
      let location = null;
      if (navigator.geolocation) {
        try {
          location = await getCurrentLocation();
        } catch (error: any) {
          console.warn("No se pudo obtener la ubicacion", error.message);
        }
      }

      const base64Data = photoUrl.split(",")[1] || photoUrl;
      const userAgent = navigator.userAgent;
      const deviceInfo = parseUserAgent(userAgent);

      const metadata = {
        latitude: location?.latitude,
        longitude: location?.longitude,
        userAgent: userAgent,
        operating_system: deviceInfo.operatingSystem,
        browser: deviceInfo.browser,
        device_model: deviceInfo.device_model,
        notes: `${
          photoType === "start" ? "Inicio" : "Fin"
        } de ruta capturado desde la app`,
        guardarBase64: true,
      };

      const result = await uploadPhoto(
        parseInt(localTrip.id),
        base64Data,
        photoType,
        metadata,
      );

      if (action === "start") {
        setStartPhoto(photoUrl);
        setStartPhotoData(result.data);
      } else {
        setEndPhoto(photoUrl);
        setEndPhotoData(result.data);
      }

      successToast(
        `Foto de ${photoType === "start" ? "inicio" : "fin"} guardada exitosamente`,
      );

      return true;
    } catch (error: any) {
      console.error("Error al subir la foto: ", error);
      let errorMessage = "No se pudo guardar la foto";
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      errorToast(
        `Error al guardar foto: ${errorMessage || "No se puede guardar la foto"}`,
      );
      return null;
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  useEffect(() => {
    if (lastMileage !== undefined && initialKmValue) {
      // Cuando cambia lastMileage, re-valida initialKm
      triggerValidation("initialKm");
    }
  }, [lastMileage, initialKmValue, triggerValidation]);

  useEffect(() => {
    if (open && trip) {
      if (JSON.stringify(trip) !== JSON.stringify(localTrip)) {
        setLocalTrip(trip);
        if (trip.initialKm !== null && trip.initialKm !== undefined)
          setValue("initialKm", trip.initialKm.toString(), {
            shouldValidate: false,
          });
        if (trip.finalKm !== null && trip.finalKm !== undefined)
          setValue("finalKm", trip.finalKm.toString(), {
            shouldValidate: false,
          });
        if (trip.tonnage !== null && trip.tonnage !== undefined)
          setValue("tonnage", trip.tonnage.toString(), {
            shouldValidate: false,
          });
        if (trip.factorKm !== null && trip.factorKm !== undefined)
          setValue("factorKm", trip.factorKm.toString(), {
            shouldValidate: false,
          });
      }
    }
  }, [open, trip, setValue, localTrip]);

  useEffect(() => {
    if (!open) {
      reset();
      setEndTime(null);
      setStartPhoto(null);
      setEndPhoto(null);
      setStartPhotoData(null);
      setEndPhotoData(null);
    }
  }, [open, reset]);

  const setStartPhotoWithUpload = async (photoUrl: string) => {
    setStartPhoto(photoUrl);
  };

  const setEndPhotoWithUpload = async (photoUrl: string) => {
    setEndPhoto(photoUrl);
  };

  const handleStartRoute = async (data: TravelControlModalData) => {
    if (!localTrip) {
      warningToast("No hay viaje seleccionado");
      return;
    }

    if (!startPhoto) {
      warningToast("Por favor, capture una foto antes de iniciar la ruta.");
      return;
    }

    try {
      if (!startPhotoData) {
        const photoUploaded = await handlePhotoCapture(
          startPhoto,
          "start",
          "start",
        );
        if (!photoUploaded) {
          return;
        }
      }

      const updatedTrip = await startRouteMutation({
        id: localTrip.id,
        mileage: parseFloat(data.initialKm),
        notes: "Inicio de Ruta",
      });

      const safeUpdatedTrip = {
        ...updatedTrip,
        tonnage: updatedTrip.tonnage ?? null,
        initialKm: updatedTrip.initialKm ?? null,
        finalKm: updatedTrip.finalKm ?? null,
        totalKm: updatedTrip.totalKm ?? null,
        totalHours: updatedTrip.totalHours ?? null,
        fuelAmount: updatedTrip.fuelAmount ?? null,
        fuelGallons: updatedTrip.fuelGallons ?? null,
        factorKm: updatedTrip.factorKm ?? null,
      };

      setLocalTrip(safeUpdatedTrip);

      if (onStatusChange) {
        onStatusChange(localTrip.id, "in_progress");
      }

      startStopwatch.start();

      infoToast("¡Ruta Iniciada!", `Kilometraje inicial: ${data.initialKm} km`);

      setOpen(false);
    } catch (error: any) {
      console.error("Error al iniciar ruta:", error);
      errorToast(
        "Error al iniciar ruta",
        error.message || "Error en el servidor",
      );
    }
  };

  const handleEndRoute = async (data: TravelControlModalData) => {
    if (!localTrip) {
      warningToast("No hay viaje seleccionado");
      return;
    }

    if (!endPhoto) {
      warningToast(
        "Foto Requerida",
        "Por favor, capture una foto antes de finalizar la ruta.",
      );
      return;
    }

    try {
      if (!endPhotoData) {
        const photoUploaded = await handlePhotoCapture(endPhoto, "end", "end");
        if (!photoUploaded) {
          return;
        }
      }

      const updatedTrip = await endRouteMutation({
        id: localTrip.id,
        mileage: parseFloat(data.finalKm),
        notes: "Fin de ruta",
        tonnage: data.tonnage ? parseFloat(data.tonnage) : undefined,
      });

      const now = new Date();
      setEndTime(now);
      const safeUpdatedTrip = {
        ...updatedTrip,
        tonnage: updatedTrip.tonnage ?? null,
      };

      setLocalTrip(safeUpdatedTrip);

      if (onStatusChange) {
        onStatusChange(localTrip.id, "fuel_pending");
      }

      startStopwatch.stop();

      infoToast(
        "¡Ruta Finalizada!",
        `Total: ${updatedTrip.totalKm || 0} km en ${
          updatedTrip.totalHours?.toFixed(2) || "0.00"
        } horas`,
      );
    } catch (error: any) {
      console.error("Error al finalizar ruta:", error);
      errorToast(
        "Error al finalizar ruta",
        error.message || "Error en el servidor",
      );
    }
  };

  const handleSaveFuel = async (data: TravelControlModalData) => {
    if (!localTrip) {
      warningToast("Error", "No hay viaje seleccionado");
      return;
    }

    try {
      const result = await registerFuelMutation({
        id: localTrip.id,
        kmFactor: parseFloat(data.factorKm),
        notes: "Combustible registrado",
        documentNumber: data.documentNumber || `SIN-${Date.now()}`,
        vatNumber: data.vatNumber || undefined,
      });

      const safeTravel = {
        ...result.travel,
        tonnage: result.travel.tonnage ?? null,
        fuelAmount: result.travel.fuelAmount ?? null,
        fuelGallons: result.travel.fuelGallons ?? null,
        factorKm: result.travel.factorKm ?? null,
      };

      setLocalTrip(safeTravel);

      if (onStatusChange) {
        onStatusChange(localTrip.id, "completed");
      }

      errorToast(
        "Combustible Registrado",
        `Monto total: S/ ${result.fuel?.fuelAmount?.toFixed(2) || "0.00"}`,
      );

      setOpen(false);
    } catch (error: any) {
      console.error("Error al registrar combustible:", error);
      errorToast(
        "Error al registrar combustible",
        error.message || "Error en el servidor",
      );
    }
  };

  // Sanitizar input numérico
  const sanitizeNumericInput = (value: string): string => {
    let sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = parts[0] + "." + parts.slice(1).join("");
    }
    return sanitized;
  };

  const handleInputChange =
    (field: keyof TravelControlModalData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = sanitizeNumericInput(e.target.value);
      setValue(field, sanitizedValue, { shouldValidate: true });
    };

  const isDriver = userComplete?.position?.toUpperCase() === "CONDUCTOR DE TRACTO CAMION";
  const isComercial =
    userComplete?.role?.toUpperCase() === "COMERCIAL Y FACTURACION TP";
  const canStart =
    localTrip?.status === "pending" &&
    initialKmValue &&
    initialKmValue.trim() !== "" &&
    isDriver &&
    !isStartingRoute &&
    !errors.initialKm &&
    !!startPhoto;
  const canEnd =
    localTrip?.status === "in_progress" &&
    finalKmValue &&
    finalKmValue.trim() !== "" &&
    isDriver &&
    !isEndingRoute &&
    !errors.finalKm &&
    (!tonnageValue || tonnageValue.trim() === "" || !errors.tonnage) &&
    !!endPhoto;

  if (!localTrip) {
    return <>{trigger}</>;
  }

  return (
    <>
      <span
        onClick={() => setOpen(true)}
        className="cursor-pointer inline-block"
      >
        {trigger}
      </span>

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Detalles del Viaje"
        subtitle={`${localTrip.tripNumber} • ${localTrip.route}`}
        side="right"
        icon="Truck"
        size="xl"
      >
        <Form {...form}>
          <div className="mt-4 space-y-6 overflow-auto max-h-[70vh] pr-4">
            <div className="flex items-center gap-2 mb-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                disabled={
                  formSubmitting ||
                  isStartingRoute ||
                  isEndingRoute ||
                  isRegisteringFuel
                }
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-end">
              <TripStatusBadge status={localTrip.status} />
            </div>

            <TripInfoSection trip={localTrip} />

            {(localTrip.status === "pending" ||
              localTrip.status === "in_progress") &&
              isDriver && (
                <RouteStartSection
                  status={localTrip.status}
                  control={control}
                  errors={errors}
                  lastMileage={lastMileage}
                  initialKmValue={initialKmValue}
                  handleInputChange={handleInputChange}
                  formSubmitting={formSubmitting}
                  isStartingRoute={isStartingRoute}
                  startPhoto={startPhoto}
                  setStartPhotoWithUpload={setStartPhotoWithUpload}
                  isUploadingPhoto={isUploadingPhoto}
                  startPhotoData={startPhotoData}
                  handleStartingRoute={handleStartingRoute}
                  canStart={canStart}
                  localTrip={localTrip}
                  getStartTime={getStartTime}
                  startStopwatch={startStopwatch}
                />
              )}

            {localTrip.status === "in_progress" && isDriver && (
              <RouteEndSection
                control={control}
                errors={errors}
                finalKmValue={finalKmValue}
                handleInputChange={handleInputChange}
                formSubmitting={formSubmitting}
                isEndingRoute={isEndingRoute}
                localTrip={localTrip}
                endPhoto={endPhoto}
                setEndPhotoWithUpload={setEndPhotoWithUpload}
                endPhotoData={endPhotoData}
                handleFinalizeRoute={handleFinalizeRoute}
                canEnd={canEnd}
                isUploadingPhoto={isUploadingPhoto}
              />
            )}

            {(localTrip.status === "completed" ||
              localTrip.status === "fuel_pending") &&
              (startPhoto || endPhoto) && (
                <PhotoEvidenceSection
                  startPhoto={startPhoto}
                  endPhoto={endPhoto}
                />
              )}

            {endTime &&
              (localTrip.status === "completed" ||
                localTrip.status === "fuel_pending") && (
                <StopwatchDisplay
                  time={endStopwatch.formattedTime}
                  label="Tiempo desde Finalizacion"
                  variant="end"
                  isRunning={endStopwatch.isRunning}
                />
              )}

            {(localTrip.status === "completed" ||
              localTrip.status === "fuel_pending") && (
              <TripMetricsSection trip={localTrip} />
            )}

            {localTrip.status === "fuel_pending" && isComercial && (
              <FuelRegistrationSection
                control={control}
                errors={errors}
                factorKmValue={factorKmValue}
                handleInputChange={handleInputChange}
                formSubmitting={formSubmitting}
                isRegisteringFuel={isRegisteringFuel}
                localTrip={localTrip}
                handleSavingFuel={handleSavingFuel}
              />
            )}

            {localTrip.fuelAmount && (
              <TripMetricsSection trip={localTrip} showFuelInfo={true} />
            )}
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={
                formSubmitting ||
                isStartingRoute ||
                isEndingRoute ||
                isRegisteringFuel
              }
              className="w-full"
            >
              Cerrar
            </Button>
          </div>
        </Form>
      </GeneralSheet>
    </>
  );
}
