
"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle, Clock, Fuel, Gauge, ImageIcon, MapPin, Package, Play, Square, Truck, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import { TravelControlDetailModalProps, TravelControlResource } from "../lib/travelControl.interface";
import { useStopwatch } from "@/shared/hooks/useStopwatch";
import { StopwatchDisplay } from "@/shared/components/StopWatchDisplay";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { PhotoCapture } from "@/components/photo-capture";
import { uploadPhoto, getCurrentLocation, TravelPhoto, parseUserAgent } from "../lib/travelPhoto.actions";
import { useEndRoute, useLastMileage, useRegisterFuel, useStartRoute } from "../lib/travelControl.hooks";
import GeneralSheet  from "@/shared/components/GeneralSheet";
import { FormInput } from "@/shared/components/FormInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTravelControlModalSchema, TravelControlModalData } from "../lib/travelControl.schema";

export function TravelControlDetailModal({ 
  trip,  
  trigger, 
  onStatusChange 
}: TravelControlDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [localTrip, setLocalTrip] = useState<TravelControlResource | null>(trip);
  const { user } = useAuthStore();
  const { data: userComplete } = useUserComplete(user.id);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [startPhoto, setStartPhoto] = useState<string | null>(null);
  const [endPhoto, setEndPhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [startPhotoData, setStartPhotoData] = useState<TravelPhoto | null>(null);
  const [endPhotoData, setEndPhotoData] = useState<TravelPhoto | null>(null);
  const { data: lastMileage} = useLastMileage(localTrip?.tracto_id ? String(localTrip.tracto_id) : undefined);

    const travelSchema = useMemo(()=> {
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
    mode: "onChange"
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

  const { toast } = useToast();
  const { mutateAsync: startRouteMutation, isPending: isStartingRoute } = useStartRoute();
  const { mutateAsync: endRouteMutation, isPending: isEndingRoute } = useEndRoute();
  const { mutateAsync: registerFuelMutation, isPending: isRegisteringFuel } = useRegisterFuel();
  
  const initialKmValue = watch("initialKm");
  const finalKmValue = watch("finalKm");
  const tonnageValue = watch("tonnage");
  const factorKmValue = watch("factorKm");

  const getStartTime = (): Date | null => {
    if(!localTrip) return null;
    const startRecord = localTrip?.driver_records?.find(
      (register) => register?.record_type === 'start'
    );
    const dateString = startRecord?.recorded_at || localTrip.startTime || null;
    if(!dateString) return null;
    try{
      return new Date(dateString);
    }catch(error){
      console.error('Error parsing date:', error);
      return null;
    }
  }

  const handleStartingRoute = async () => {
    const isValid = await triggerValidation(["initialKm"]);

    if(!isValid) {
      toast({
        title: 'Error de validación',
        description: 'Por favor, corrige el kilometraje inicial',
        variant: 'destructive'
      });
      return;
    }

    if (!startPhoto) {
    toast({ 
      title: 'Foto requerida', 
      description: 'Por favor, capture una foto antes de iniciar la ruta.', 
      variant: 'destructive' 
    });
    return;
  }

    const formData = getValues();
    await handleStartRoute(formData);
  }

  const handleSavingFuel = async () => {
    const isValid = await triggerValidation("factorKm");

    if(!isValid){
      toast({
            title: 'Error de validación',
            description: errors.factorKm?.message || 'Por favor, corrige el factor KM',
            variant: 'destructive'
          });
          return;
    }

    const formData = getValues();
    await handleSaveFuel(formData);
  }

  const handleFinalizeRoute = async () => {

    const isValid = await triggerValidation(["finalKm"]);

    if(!isValid){
      toast({
        title: 'Error de validacion',
        description: 'Por favor, corrige los errores en el formulario',
        variant: 'destructive'
      });
      return;
    }

    if (!endPhoto) {
    toast({ 
      title: 'Foto requerida', 
      description: 'Por favor, capture una foto antes de finalizar la ruta.', 
      variant: 'destructive' 
        });
        return false;
      }
 

    const formData = getValues();
    await handleEndRoute(formData);
  }


  
  const startStopwatch = useStopwatch(getStartTime());
  const endStopwatch = useStopwatch(endTime);

  const handlePhotoCapture = async(
    photoUrl: string,
    photoType: 'start' | 'end',
    action: 'start' | 'end'
  ) => {
    if(!localTrip){
      toast({
        title: 'Error',
        description: 'No hay viaje seleccionado',
        variant: 'destructive',
      });
      return;
    }

    try{
      setIsUploadingPhoto(true);
      let location = null;
      if(navigator.geolocation){
        try{
          location = await getCurrentLocation();
        }catch(error: any){
          console.warn('No se pudo obtener la ubicacion', error.message);
        }
      }

      const base64Data = photoUrl.split(',')[1] || photoUrl;
      const userAgent = navigator.userAgent;
      const deviceInfo = parseUserAgent(userAgent);

      const metadata = {
        latitude: location?.latitude,
        longitude: location?.longitude,
        userAgent: userAgent,
        operating_system: deviceInfo.operatingSystem,
        browser: deviceInfo.browser,
        device_model: deviceInfo.device_model,
        notes: `${photoType === 'start' ? 'Inicio': 'Fin'} de ruta capturado desde la app`,
        guardarBase64: true 
      };

      const result = await uploadPhoto(
        parseInt(localTrip.id),
        base64Data,
        photoType,
        metadata
      )

      if(action === 'start'){
        setStartPhoto(photoUrl);
        setStartPhotoData(result.data);
      }else{
        setEndPhoto(photoUrl);
        setEndPhotoData(result.data);
      }

      toast({
        title: 'Foto guardada',
        description: `Foto de ${photoType === 'start' ? 'inicio': 'fin'} guardada exitosamente`,
        variant: 'default',
      });

      return true;

    }catch(error: any){
      console.error('Error al subir la foto: ', error);
      let errorMessage = 'No se pudo guardar la foto';
      if(error.message){
        errorMessage = error.message;
      }else if(error.response?.data?.message){
        errorMessage = error.response.data.message;
      }
      toast({
        title: 'Error al guardar foto',
        description: errorMessage|| 'No se puede guardar la foto',
        variant: 'destructive'
      });
      return null;
    }finally{
      setIsUploadingPhoto(false);
    }
  }

  useEffect(() => {
  if (lastMileage !== undefined && initialKmValue) {
    // Cuando cambia lastMileage, re-valida initialKm
    triggerValidation("initialKm");
  }
  }, [lastMileage, initialKmValue, triggerValidation]);
  
  useEffect(() => {
    if (open && trip) {
      if(JSON.stringify(trip) !== JSON.stringify(localTrip)){
        setLocalTrip(trip);
        if (trip.initialKm !== null && trip.initialKm !== undefined) 
          setValue("initialKm", trip.initialKm.toString(), { shouldValidate: false });
        if (trip.finalKm !== null && trip.finalKm !== undefined) 
          setValue("finalKm", trip.finalKm.toString(), { shouldValidate: false });
        if (trip.tonnage !== null && trip.tonnage !== undefined) 
          setValue("tonnage", trip.tonnage.toString(), { shouldValidate: false });
        if (trip.factorKm !== null && trip.factorKm !== undefined) 
          setValue("factorKm", trip.factorKm.toString(), { shouldValidate: false });
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
  }

  const setEndPhotoWithUpload = async (photoUrl: string) => {
    setEndPhoto(photoUrl);
  }
  
  const handleStartRoute = async (data: TravelControlModalData) => {
    if (!localTrip) {
      toast({
        title: 'Error',
        description: 'No hay viaje seleccionado',
        variant: 'destructive',
      });
      return;
    }
    
    if(!startPhoto){
      toast({
        title: 'Foto Requerida',
        description: 'Por favor, capture una foto antes de iniciar la ruta.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if(!startPhotoData){
        const photoUploaded = await handlePhotoCapture(startPhoto, 'start', 'start');
        if(!photoUploaded){
          return;
        }
      }

      const updatedTrip = await startRouteMutation({
        id: localTrip.id,
        mileage: parseFloat(data.initialKm),
        notes: 'Inicio de Ruta'
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
      
      if(onStatusChange) {
        onStatusChange(localTrip.id, 'in_progress');
      }

      startStopwatch.start();

      toast({
        title: "¡Ruta Iniciada!",
        description: `Kilometraje inicial: ${data.initialKm} km`
      });

      setOpen(false);

    } catch(error: any) {
      console.error('Error al iniciar ruta:', error);
      toast({
        title: "Error al iniciar ruta",
        description: error.message || "Error en el servidor",
        variant: "destructive"
      });
    }
  };

  const handleEndRoute = async (data: TravelControlModalData) => {
    if (!localTrip) {
      toast({
        title: 'Error',
        description: 'No hay viaje seleccionado',
        variant: 'destructive',
      });
      return;
    }
    
    if(!endPhoto){
      toast({
        title: 'Foto Requerida',
        description: 'Por favor, capture una foto antes de finalizar la ruta.',
        variant: 'destructive',
      });
      return;
    }

    try {
      if(!endPhotoData){
        const photoUploaded = await handlePhotoCapture(endPhoto, 'end', 'end');
        if(!photoUploaded){
          return;
        }
      }

      const updatedTrip = await endRouteMutation({
        id: localTrip.id,
        mileage: parseFloat(data.finalKm),
        notes: "Fin de ruta",
        tonnage: data.tonnage ? parseFloat(data.tonnage) : undefined
      });

      const now = new Date();
      setEndTime(now);
      const safeUpdatedTrip = {
        ...updatedTrip,
        tonnage: updatedTrip.tonnage ?? null
      };
      
      setLocalTrip(safeUpdatedTrip);
      
      if(onStatusChange) {
        onStatusChange(localTrip.id, 'fuel_pending');
      }

      startStopwatch.stop();

      toast({
        title: "¡Ruta Finalizada!",
        description: `Total: ${updatedTrip.totalKm || 0} km en ${updatedTrip.totalHours?.toFixed(2) || '0.00'} horas`,
      });

    } catch(error: any) {
      console.error('Error al finalizar ruta:', error);
      toast({
        title: "Error al finalizar ruta",
        description: error.message || "Error en el servidor",
        variant: "destructive"
      });
    }
  };

  const handleSaveFuel = async (data:TravelControlModalData) => {
    console.log("DATOS DEL FORMULARIO PARA COMBUSTIBLE:", data);
    console.log("LOCAL TRIP:", localTrip);
    
    if(!localTrip) {
      toast({
        title: 'Error',
        description: 'No hay viaje seleccionado',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await registerFuelMutation({
        id: localTrip.id,
        kmFactor: parseFloat(data.factorKm),
        notes: "Combustible registrado",
        documentNumber: data.documentNumber || `SIN-${Date.now()}`,
        vatNumber: data.vatNumber || undefined
      });

      const safeTravel = {
        ...result.travel,
        tonnage: result.travel.tonnage ?? null,
        fuelAmount: result.travel.fuelAmount ?? null,
        fuelGallons: result.travel.fuelGallons ?? null,
        factorKm: result.travel.factorKm ?? null,
      };
      
      setLocalTrip(safeTravel);
      
      if(onStatusChange) {
        onStatusChange(localTrip.id, 'completed');
      }

      toast({
        title: "Combustible Registrado",
        description: `Monto total: S/ ${result.fuel?.fuelAmount?.toFixed(2) || '0.00'}`,
      });

      setOpen(false);

    } catch(error: any) {
      console.error('Error al registrar combustible:', error);
      toast({
        title: "Error al registrar combustible",
        description: error.message || "Error en el servidor",
        variant: "destructive"
      });
    } 
  };

  // Sanitizar input numérico
  const sanitizeNumericInput = (value: string): string => {
    let sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      sanitized = parts[0] + '.' + parts.slice(1).join('');
    }
    return sanitized;
  };

  const handleInputChange = (field: keyof TravelControlModalData) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitizedValue = sanitizeNumericInput(e.target.value);
      setValue(field, sanitizedValue, { shouldValidate: true });
    };

  const isDriver = userComplete?.position?.toUpperCase() === 'CONDUCTOR DE TRACTO CAMION';
  const isComercial = userComplete?.role?.toUpperCase() === 'COMERCIAL Y FACTURACION TP';
  const canStart = localTrip?.status === 'pending' && 
                    initialKmValue && 
                    initialKmValue.trim() !== "" &&
                    isDriver && 
                    !isStartingRoute &&
                    !errors.initialKm && 
                    !!startPhoto;
  const canEnd = localTrip?.status === 'in_progress' && 
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
        className="w-[90vw] max-w-[800px] overflow-auto"
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
                disabled={formSubmitting || isStartingRoute || isEndingRoute || isRegisteringFuel}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex justify-end">
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize gap-2",
                  localTrip.status === "pending" && "bg-yellow-50 border-yellow-200 text-yellow-800",
                  localTrip.status === "in_progress" && "bg-green-50 border-green-200 text-green-800",
                  localTrip.status === "completed" && "bg-blue-50 border-blue-200 text-blue-800",
                  localTrip.status === "fuel_pending" && "bg-orange-50 border-orange-200 text-orange-800"
                )}
              >
                {localTrip.status === "pending" && <Clock className="size-3" />}
                {localTrip.status === "in_progress" && <Play className="size-3" />}
                {localTrip.status === "completed" && <CheckCircle className="size-3" />}
                {localTrip.status === "fuel_pending" && <Fuel className="size-3" />}
                {localTrip.status === "pending" && "Pendiente"}
                {localTrip.status === "in_progress" && "En Ruta"}
                {localTrip.status === "completed" && "Completado"}
                {localTrip.status === "fuel_pending" && "Combustible Pendiente"}
              </Badge>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información del Viaje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={Truck} label="Placa" value={localTrip.plate || "Sin placa"} />
                <InfoItem icon={User} label="Conductor" value={localTrip.driver?.name || "Sin Conductor"} />
                <InfoItem icon={MapPin} label="Ruta" value={localTrip.route || "Sin Ruta"} />
                <InfoItem icon={Package} label="Cliente" value={localTrip.client || "Sin cliente"} />
              </div>
            </div>

            {(localTrip.status === "pending" || localTrip.status === "in_progress") && isDriver && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-600" />
                  {localTrip.status === "pending" ? "Inicio de Ruta" : "Ruta en Progreso"}
                </h3>

                {localTrip.status === "pending" ? (
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
                    {/* Mostrar información del último registro */}
                    {lastMileage && lastMileage > 0 && (
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        <p>Último registro del vehículo: {lastMileage} km</p>
                        {initialKmValue && !errors.initialKm && (() => {
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
                          <CheckCircle className="h-4 w-4"/>
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
                          {
                            getStartTime() ? new Date(getStartTime()!).toLocaleString('es-PE') : 'N/A'
                          } • {localTrip.initialKm} km
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
                      time = {startStopwatch.formattedTime}
                      label = "Tiempo en ruta"
                      variant = "start"
                      isRunning={startStopwatch.isRunning}
                    />
                  </div>
                )}
              </div>
            )}

            {localTrip.status === "in_progress" && isDriver && (
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
                    
                    {finalKmValue && !errors.finalKm && localTrip?.initialKm && (() => {
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
                    addonStart={<Package className="h-4 w-4 text-gray-500"/>}
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
            )}

            {(localTrip.status === 'completed' || localTrip.status === 'fuel_pending') && (startPhoto || endPhoto) && (
              <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 animate-slide-up">
                <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-primary"/>
                  Evidencia Fotografica
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {startPhoto && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Inicio</p>
                      <img
                        src={startPhoto}
                        alt="Foto de Inicio"
                        className="w-full h-24 object-cover rounded-lg border border-success/30"
                      />
                    </div>
                  )}
                  {endPhoto && (
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Fin</p>
                      <img
                        src={endPhoto}
                        alt="Foto de fin"
                        className="w-full h-24 object-cover rounded-lg border border-destructive/30"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {endTime && (localTrip.status === "completed" || localTrip.status === 'fuel_pending') && (
              <StopwatchDisplay
                  time={endStopwatch.formattedTime}
                  label="Tiempo desde Finalizacion"
                  variant="end"
                  isRunning={endStopwatch.isRunning}
              />
            )}
            
            {(localTrip.status === "completed" || localTrip.status === "fuel_pending") &&(
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Métricas del Viaje</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <MetricCard
                    label="Km Inicial"
                    value={localTrip.initialKm?.toString() || "-"}
                    subtext="km"
                  />
                  <MetricCard
                    label="Km Final"
                    value={localTrip.finalKm?.toString() || "-"}
                    subtext="km"
                  />
                  <MetricCard
                    label="Total Km"
                    value={localTrip.totalKm?.toString() || "-"}
                    subtext="km"
                  />
                  <MetricCard
                    label="Horas Totales"
                    value={localTrip.totalHours?.toFixed(2) || "-"}
                    subtext="horas"
                  />
                  {localTrip.tonnage && (
                    <MetricCard
                      label="Toneladas"
                      value={localTrip.tonnage.toString()}
                      subtext="ton"
                    />
                  )}
                </div>
              </div>
            )}
            
            {localTrip.status === "fuel_pending" && isComercial && (
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
                        S/ {(parseFloat(factorKmValue) * (localTrip.totalKm || 0)).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleSavingFuel()}
                    disabled={!factorKmValue || !!errors.factorKm  || isRegisteringFuel}
                    className="w-full bg-orange-600 hover:bg-orange-700"
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
            )}
            
            {localTrip.fuelAmount && (
              <div className="space-y-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-blue-600" />
                  Combustible Registrado
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard
                    label="Factor Km"
                    value={`S/ ${localTrip.factorKm?.toFixed(2)}`}
                    subtext="por km"
                  />
                  <MetricCard
                    label="Galones"
                    value={localTrip.fuelGallons?.toString() || "-"}
                    subtext="galones"
                  />
                  <div className="col-span-2">
                    <MetricCard
                      label="Monto Total"
                      value={`S/ ${localTrip.fuelAmount?.toFixed(2)}`}
                      subtext="combustible"
                      highlight
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={formSubmitting  || isStartingRoute || isEndingRoute || isRegisteringFuel}
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

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  subtext,
  highlight,
}: {
  label: string;
  value: string;
  subtext?: string;
  highlight?: boolean;
}) {
  return (
    <div className={cn(
      "p-3 rounded-lg flex flex-col items-center justify-center text-center",
      highlight ? "bg-blue-600 text-white" : "bg-white border border-gray-200"
    )}>
      <p className={cn(
        "text-xs font-medium mb-1",
        highlight ? "text-blue-100" : "text-gray-600"
      )}>
        {label}
      </p>
      <p className={cn(
        "text-lg font-bold",
        highlight ? "text-white" : "text-gray-900"
      )}>
        {value}
      </p>
      {subtext && (
        <p className={cn(
          "text-xs mt-1",
          highlight ? "text-blue-100" : "text-gray-500"
        )}>
          {subtext}
        </p>
      )}
    </div>
  );
}
