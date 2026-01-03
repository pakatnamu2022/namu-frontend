"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowLeft, CheckCircle, Clock, Fuel, Gauge, ImageIcon, MapPin, Package, Play, Square, Truck, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { TravelControlDetailModalProps, TravelControlResource } from "../lib/travelControl.interface";
import { useStopwatch } from "@/shared/hooks/useStopwatch";
import { StopwatchDisplay } from "@/shared/components/stopwatch-display";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import { PhotoCapture } from "@/components/photo-capture";
import { uploadPhoto, getCurrentLocation, TravelPhoto } from "../lib/travelPhoto.actions";
import { useEndRoute, useLastMileage, useRegisterFuel, useStartRoute } from "../lib/travelControl.hooks";

export function TravelControlDetailModal({ 
  trip,  
  trigger, 
  onStatusChange 
}: TravelControlDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [localTrip, setLocalTrip] = useState<TravelControlResource | null>(trip);
  const [initialKm, setInitialKm] = useState("");
  const [finalKm, setFinalKm] = useState("");
  const [tonnage, setTonnage] = useState("");
  const [factorKm, setFactorKm] = useState("");
  //const [fuelGallons, setFuelGallons] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [numeroDoc, setNumeroDoc] = useState("");
  const [ruc, setRuc] = useState("");
  const { user } = useAuthStore();
  const { data: userComplete } = useUserComplete(user.id);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [startPhoto, setStartPhoto] = useState<string | null>(null);
  const [endPhoto, setEndPhoto] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [startPhotoData, setStartPhotoData] = useState<TravelPhoto | null>(null);
  const [endPhotoData, setEndPhotoData] = useState<TravelPhoto | null>(null);
  
  const { toast } = useToast();
  const { mutateAsync: startRouteMutation, isPending: isStartingRoute } = useStartRoute();
  const { mutateAsync: endRouteMutation, isPending: isEndingRoute } = useEndRoute();
  const { mutateAsync: registerFuelMutation, isPending: isRegisteringFuel } = useRegisterFuel();
  const { data: lastMileage} = useLastMileage(localTrip?.tracto_id ? String(localTrip.tracto_id) : undefined);

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
          if(!location){
            console.warn('No se pudo obtener ubicacion');
          }

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
        device_model: deviceInfo.deviceModel,
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

      console.log('Foto subida exitosamente: ', result);

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
  
function parseUserAgent(userAgent: string): {
    operatingSystem: string;
    browser: string;
    deviceModel: string;
} {
    const info = {
        operatingSystem: 'Desconocido',
        browser: 'Desconocido',
        deviceModel: 'Desconocido'
    };

    if (userAgent.includes('iPhone')) {
        info.operatingSystem = 'iOS';
        const match = userAgent.match(/iPhone\s+(\d+)/);
        if (match) info.deviceModel = `iPhone ${match[1]}`;
    } else if (userAgent.includes('Android')) {
        info.operatingSystem = 'Android';
        if (userAgent.includes('Samsung')) info.deviceModel = 'Samsung Galaxy';
    } else if (userAgent.includes('Windows')) {
        info.operatingSystem = 'Windows';
    } else if (userAgent.includes('Mac')) {
        info.operatingSystem = 'macOS';
    }

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        info.browser = 'Chrome';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        info.browser = 'Safari';
    }

    return info;
}

  useEffect(() => {
    if (open && trip) {

      if(JSON.stringify(trip) !== JSON.stringify(localTrip)){
        setLocalTrip(trip);
        if (trip.initialKm) setInitialKm(trip.initialKm.toString());
        if (trip.finalKm) setFinalKm(trip.finalKm.toString());
        if (trip.tonnage) setTonnage(trip.tonnage.toString());
        if (trip.factorKm) setFactorKm(trip.factorKm.toString());
        //if (trip.fuelGallons) setFuelGallons(trip.fuelGallons.toString());
      }
      
    }
  }, [open, trip]);
  
  useEffect(() => {
    if (!open) {
      setInitialKm("");
      setFinalKm("");
      setTonnage("");
      setFactorKm("");
      setValidationError(null);
      setNumeroDoc("");
      setRuc("");
      setEndTime(null);
      setStartPhoto(null);
      setEndPhoto(null);
      setStartPhotoData(null);
      setEndPhotoData(null);
    }
  }, [open]);

  const validateInitialKm = (value: string): boolean => {
    const km = parseFloat(value);

    if(isNaN(km)){
      setValidationError("Por favor ingrese un valor numerico valido...");
      return false;
    }
    if(lastMileage && lastMileage > 0 && km < lastMileage){
      setValidationError(`El km inicial no puede ser menor al ultimo registro del vehiculo (${lastMileage} km)`);
      return false;
    }

    if(trip?.previousFinalKm && km < trip.previousFinalKm){
      setValidationError(`El km inicial no puede ser menor al km final del viaje anterior (${trip.previousFinalKm} km)`);
      return false;
    }
    setValidationError(null);
    return true;
  }

  const validateFinalKm = (value: string): boolean => {
    const km = parseFloat(value);
    const initial = parseFloat(initialKm);
    if (isNaN(km)){
      setValidationError("Por favor ingrese un valor numerico valido..");
      return false;
    }
    if (km <= initial) {
      setValidationError(`El km final debe ser mayor al km inicial (${initial} km)`);
      return false;
    }
    setValidationError(null);
    return true;
  };



  const setStartPhotoWithUpload = async (photoUrl: string) => {
    setStartPhoto(photoUrl);
  }

  const setEndPhotoWithUpload = async (photoUrl: string) => {
    setEndPhoto(photoUrl);
  }
  // const handleEndRoute = async () => {
  //   if (!localTrip || !validateFinalKm(finalKm)) return;
  //   if(!endPhoto){
  //     toast({
  //       title: 'Foto Requerida',
  //       description: 'Por favor, capture una foto antes de finalizar la ruta.',
  //       variant: 'destructive',
  //     });
  //     return;
  //   }

  //   if(endPhotoData){
  //     console.log("Usando foto ya subida: ", endPhotoData.id);
  //   }else{
  //     const photoUploaded = await handlePhotoCapture(endPhoto, 'end', 'end');
  //     if(!photoUploaded){
  //       return;
  //     }
  //   }

  //   try{
  //     setIsSubmitting(true);

  //     await endRouteMutation({
  //       id: localTrip.id,
  //       mileage: parseFloat(finalKm),
  //       notes: "Fin de ruta",
  //       tonnage: tonnage ? parseFloat(tonnage) : undefined
  //     });

  //     const now = new Date();
  //     setEndTime(now);
  //     const startTime = localTrip.startTime ? new Date(localTrip.startTime) : now;
  //     const totalHours = (now.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  //     const totalKm = parseFloat(finalKm) - (localTrip.initialKm || 0);

  //     startStopwatch.stop();
  //     const updatedTrip = {
  //       ...localTrip,
  //       status: 'fuel_pending' as const,
  //       endTime: now.toISOString(),
  //       finalKm: parseFloat(finalKm),
  //       totalHours: parseFloat(totalHours.toFixed(2)),
  //       totalKm,
  //       tonnage: tonnage ? parseFloat(tonnage) : undefined,
  //     };

  //     setLocalTrip(updatedTrip);
  //     if(onStatusChange) onStatusChange(localTrip.id, 'fuel_pending');

  //     toast({
  //     title: "¡Ruta Finalizada!",
  //     description: `Total: ${totalKm} km en ${totalHours.toFixed(2)} horas`,
  //   });


  //   }catch(error: any){
  //     toast({
  //       title: "Error al finalizar ruta",
  //       description: error.response?.data?.message || "Error en el servidor",
  //       variant: "destructive"
  //     });
  //   }finally{
  //     setIsSubmitting(false);
  //   }

  // };

    const handleEndRoute = async () => {
    if (!localTrip) {
      toast({
        title: 'Error',
        description: 'No hay viaje seleccionado',
        variant: 'destructive',
      });
      return;
    }
    
    if (!validateFinalKm(finalKm)) return;
    
    if(!endPhoto){
      toast({
        title: 'Foto Requerida',
        description: 'Por favor, capture una foto antes de finalizar la ruta.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      if(!endPhotoData){
        const photoUploaded = await handlePhotoCapture(endPhoto, 'end', 'end');
        if(!photoUploaded){
          return;
        }
      }

      const updatedTrip = await endRouteMutation({
        id: localTrip.id,
        mileage: parseFloat(finalKm),
        notes: "Fin de ruta",
        tonnage: tonnage ? parseFloat(tonnage) : undefined
      });

      const now = new Date();
      setEndTime(now);
      const safeUpdatedTrip = {
        ...updatedTrip,
        tonnage: updatedTrip.tonnage !== undefined ? updatedTrip.tonnage : null
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
    } finally {
      setIsSubmitting(false);
    }
  };

 

  const handleStartRoute = async () => {
  if (!localTrip) {
    toast({
      title: 'Error',
      description: 'No hay viaje seleccionado',
      variant: 'destructive',
    });
    return;
  }
  
  if (!validateInitialKm(initialKm)) return;
  
  if(!startPhoto){
    toast({
      title: 'Foto Requerida',
      description: 'Por favor, capture una foto antes de iniciar la ruta.',
      variant: 'destructive',
    });
    return;
  }

  try {
    setIsSubmitting(true);

    // Subir foto si no está subida
    if(!startPhotoData){
      const photoUploaded = await handlePhotoCapture(startPhoto, 'start', 'start');
      if(!photoUploaded){
        return;
      }
    }

    const updatedTrip = await startRouteMutation({
      id: localTrip.id,
      mileage: parseFloat(initialKm),
      notes: 'Inicio de Ruta'
    });

    // Asegurar tipos compatibles
    const safeUpdatedTrip = {
      ...updatedTrip,
      tonnage: updatedTrip.tonnage !== undefined ? updatedTrip.tonnage : null,
      initialKm: updatedTrip.initialKm !== undefined ? updatedTrip.initialKm : null,
      finalKm: updatedTrip.finalKm !== undefined ? updatedTrip.finalKm : null,
      totalKm: updatedTrip.totalKm !== undefined ? updatedTrip.totalKm : null,
      totalHours: updatedTrip.totalHours !== undefined ? updatedTrip.totalHours : null,
      fuelAmount: updatedTrip.fuelAmount !== undefined ? updatedTrip.fuelAmount : null,
      fuelGallons: updatedTrip.fuelGallons !== undefined ? updatedTrip.fuelGallons : null,
      factorKm: updatedTrip.factorKm !== undefined ? updatedTrip.factorKm : null,
    };
    
    setLocalTrip(safeUpdatedTrip);
    
    if(onStatusChange) {
      onStatusChange(localTrip.id, 'in_progress');
    }

    startStopwatch.start();

    toast({
      title: "¡Ruta Iniciada!",
      description: `Kilometraje inicial: ${initialKm} km`
    });

    setOpen(false);

  } catch(error: any) {
    console.error('Error al iniciar ruta:', error);
    toast({
      title: "Error al iniciar ruta",
      description: error.message || "Error en el servidor",
      variant: "destructive"
    });
  } finally {
    setIsSubmitting(false);
  }
};

const handleSaveFuel = async () => {
  if(!localTrip) {
    toast({
      title: 'Error',
      description: 'No hay viaje seleccionado',
      variant: 'destructive',
    });
    return;
  }
  
  if(!factorKm) {
    setValidationError("El factor km es requerido");
    return;
  }

  const numFactor = parseFloat(factorKm);

  if(isNaN(numFactor) || numFactor <= 0){
    setValidationError("El factor debe ser un número mayor a 0...");
    return;
  }

  try {
    setIsSubmitting(true);
    
    const result = await registerFuelMutation({
      id: localTrip.id,
      kmFactor: numFactor,
      notes: "Combustible registrado",
      documentNumber: numeroDoc,
      vatNumber: ruc || undefined
    });

    // Asegurar tipos compatibles para el travel
    const safeTravel = {
      ...result.travel,
      tonnage: result.travel.tonnage !== undefined ? result.travel.tonnage : null,
      fuelAmount: result.travel.fuelAmount !== undefined ? result.travel.fuelAmount : null,
      fuelGallons: result.travel.fuelGallons !== undefined ? result.travel.fuelGallons : null,
      factorKm: result.travel.factorKm !== undefined ? result.travel.factorKm : null,
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
  } finally {
    setIsSubmitting(false);
  }
};

  const isDriver = userComplete?.role?.toUpperCase() === 'CONDUCTOR TP';
  const isComercial = userComplete?.role?.toUpperCase() === 'COMERCIAL Y FACTURACION TP';
  const canStart = localTrip?.status === 'pending' && initialKm && isDriver && !isStartingRoute;
  const canEnd = localTrip?.status === 'in_progress' && finalKm && isDriver && !isEndingRoute;
  const canSaveFuel = localTrip?.status === 'fuel_pending' && factorKm  && isComercial && !isRegisteringFuel;

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
      
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-[90vw] max-w-[800px] overflow-auto">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <SheetTitle className="text-xl">Detalles del Viaje</SheetTitle>
            </div>
            <SheetDescription>
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-semibold text-lg">{localTrip.tripNumber}</span>
                  <span className="text-muted-foreground ml-2">• {localTrip.route}</span>
                </div>
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
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 overflow-auto max-h-[70vh] pr-4">
            {/* Información del Viaje */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información del Viaje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={Truck} label="Placa" value={localTrip.plate || "Sin placa"} />
                <InfoItem icon={User} label="Conductor" value={localTrip.driver?.name || "Sin Conductor"} />
                <InfoItem icon={MapPin} label="Ruta" value={localTrip.route || "Sin Ruta"} />
                <InfoItem icon={Package} label="Cliente" value={localTrip.client || "Sin cliente"} />
              </div>
            </div>

            {/* Error de validación */}
            {validationError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{validationError}</p>
              </div>
            )}

            {/* Sección Inicio de Ruta */}
            {(localTrip.status === "pending" || localTrip.status === "in_progress") && isDriver && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Play className="h-4 w-4 text-green-600" />
                  {localTrip.status === "pending" ? "Inicio de Ruta" : "Ruta en Progreso"}
                </h3>

                {localTrip.status === "pending" ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="initialKm">Kilometraje Inicial *</Label>
                      <div className="relative mt-1">
                        <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <Input
                          id="initialKm"
                          type="number"
                          step="0.01"
                          placeholder={`Mínimo: ${lastMileage || 0} km`}
                          value={initialKm}
                          onChange={(e) => {
                            setInitialKm(e.target.value);
                            if (e.target.value) validateInitialKm(e.target.value);
                          }}
                          className="pl-10"
                          disabled={isSubmitting}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1 space-y-1">
                        {lastMileage && lastMileage > 0 && (
                          <p>Último registro del vehiculo: {lastMileage} km</p>
                        )}
                        {trip.previousFinalKm && (
                        <p className="text-xs text-gray-500 mt-1">
                          Km final del viaje anterior: {trip.previousFinalKm} km
                        </p>
                         )}

                      </div>
                    </div>

                    <PhotoCapture
                        onPhotoCapture={setStartPhotoWithUpload}
                        capturedPhoto={startPhoto}
                        label="Foto de Inicio"
                        variant="start"
                        disabled={isUploadingPhoto || isSubmitting}
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
                    )

                    }

                    <Button
                      onClick={handleStartRoute}
                      disabled={!canStart || isUploadingPhoto}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      

                      {isSubmitting ? (
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
                          //fecha_inicio_ruta() ? new Date(fecha_inicio_ruta()).toLocaleString('es-PE') : 'N/A'
                        
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

            {/* Sección Fin de Ruta */}
            {localTrip.status === "in_progress" && isDriver && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Square className="h-4 w-4 text-blue-600" />
                  Fin de Ruta
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="finalKm">Kilometraje Final *</Label>
                    <div className="relative mt-1">
                      <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="finalKm"
                        type="number"
                        step="0.01"
                        placeholder={`Mayor a: ${localTrip.initialKm || 0} km`}
                        value={finalKm}
                        onChange={(e) => {
                          setFinalKm(e.target.value);
                          if (e.target.value) validateFinalKm(e.target.value);
                        }}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="tonnage">Toneladas Transportadas (opcional)</Label>
                    <div className="relative mt-1">
                      <Package className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <Input
                        id="tonnage"
                        type="number"
                        step="0.01"
                        placeholder="Ej: 25"
                        value={tonnage}
                        onChange={(e) => setTonnage(e.target.value)}
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>

                  <PhotoCapture
                    onPhotoCapture={setEndPhotoWithUpload}
                    capturedPhoto={endPhoto}
                    label="Foto de Finalizacion"
                    variant="end"
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
                    onClick={handleEndRoute}
                    disabled={!canEnd || isUploadingPhoto}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
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


            {/* muestra el fin del cronometro */}
            {endTime && (localTrip.status === "completed" || localTrip.status === 'fuel_pending') && (
              <StopwatchDisplay
                  time={endStopwatch.formattedTime}
                  label="Tiempo desde Finalizacion"
                  variant="end"
                  isRunning={endStopwatch.isRunning}
              />
            )}

            {/* Métricas del Viaje */}
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

            {/* Sección Combustible (para Jimmi del area comercial) */}
            {localTrip.status === "fuel_pending" && isComercial && (
              <div className="space-y-4 p-4 bg-orange-50 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2">
                  <Fuel className="h-4 w-4 text-orange-600" />
                  Registro de Combustible
                </h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="factorKm">Factor Kilómetro (S/. por km) *</Label>
                    <Input
                      id="factorKm"
                      type="number"
                      step="0.1"
                      placeholder="Ej: 1.8"
                      value={factorKm}
                      onChange={(e) => setFactorKm(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>

                  {/* <div>
                    <Label htmlFor="fuelGallons">Combustible (galones) *</Label>
                    <Input
                      id="fuelGallons"
                      type="number"
                      step="0.1"
                      placeholder="Ej: 45.5"
                      value={fuelGallons}
                      onChange={(e) => setFuelGallons(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div> */}

                  {factorKm && localTrip.totalKm && (
                    <div className="p-4 bg-white rounded-lg border">
                      <p className="text-sm text-gray-600">Monto Calculado</p>
                      <p className="text-2xl font-bold">
                        S/ {(parseFloat(factorKm) * (localTrip.totalKm || 0)).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <Button
                    onClick={handleSaveFuel}
                    disabled={!canSaveFuel}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                  >
                    {isSubmitting ? (
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
              </div>
            )}

            {/* Combustible Registrado */}
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

          <SheetFooter className="mt-6 pt-4 border-t">
            <Button 
            variant="outline" 
            onClick={() => setOpen(false)}
            disabled={isSubmitting}
            >
              Cerrar
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );

  
}

// Componentes auxiliares (se mantienen igual)
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