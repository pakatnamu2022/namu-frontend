"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Fuel,
  Gauge,
  MapPin,
  Package,
  Play,
  Square,
  Truck,
  User,
  Lock,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Pencil,
  X,
  Save,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Form } from "@/components/ui/form";
import {
  TravelControlDetailModalProps,
  TravelControlResource,
  SubTrip,
  SubTripStatus,
  TripStatus,
} from "../lib/travelControl.interface";
import { useStopwatch } from "@/shared/hooks/useStopwatch";
import { StopwatchDisplay } from "@/shared/components/StopWatchDisplay";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useUserComplete } from "@/features/gp/gestionsistema/usuarios/lib/user.hook";
import {
  useEndRoute,
  useLastMileage,
  useRegisterFuel,
  useStartRoute,
  useStartSegment,
  useEndSegment,
  useUpdateTravelMileage
} from "../lib/travelControl.hooks";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { FormInput } from "@/shared/components/FormInput";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTravelControlModalSchema,
  TravelControlModalData,
} from "../lib/travelControl.schema";
import { errorToast, successToast } from "@/core/core.function";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCurrentLocation } from "../lib/travelPhoto.actions";
import { useSegments } from "../lib/travelControl.hooks";
import { useExportTravelReport } from "../lib/travelControl.hooks";
import { Loader2, Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function TravelControlDetailModal({
  trip,
  trigger,
  onStatusChange,
  permissions
}: TravelControlDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [localTrip, setLocalTrip] = useState<TravelControlResource | null>(
    trip,
  );
  const { user } = useAuthStore();
  const { data: userComplete } = useUserComplete(user.id);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const { data: lastMileage } = useLastMileage(
    localTrip?.tracto_id ? String(localTrip.tracto_id) : undefined,
  );
  const { data: segmentsData} = useSegments(localTrip?.id);
  const { canUpdate, canExport } = permissions;
  // Estado para los SubTrips
  const [subTrips, setSubTrips] = useState<SubTrip[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [kmInputs, setKmInputs] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isEditingMileage, setIsEditingMileage] = useState(false);
  const [editFormData, setEditFormData] = useState<{
      general_initial_km: string;
      general_final_km: string;
      segments: Record<string, { initial: string; final: string }>;

  }>({
    general_initial_km: "",
    general_final_km: "",
    segments: {},
  });

  const { mutateAsync: updateMileage, isPending: isUpdatingMileage } = useUpdateTravelMileage();

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
    formState: { errors: formErrors, isSubmitting: formSubmitting },
    setValue,
    watch,
    getValues,
    trigger: triggerValidation,
  } = form;

  const { mutateAsync: startRouteMutation, isPending: isStartingRoute } =
    useStartRoute();
  const { isPending: isEndingRoute } =
    useEndRoute();
  const { mutateAsync: registerFuelMutation, isPending: isRegisteringFuel } =
    useRegisterFuel();

  const { mutateAsync: startSegmentMutation } = useStartSegment();
  const { mutateAsync: endSegmentMutation } = useEndSegment();
  const { mutate: exportReport, isPending: isExporting } = useExportTravelReport();
 


  const tonnageValue = watch("tonnage");
  const factorKmValue = watch("factorKm");
  
    const sortedSubTrips = [...subTrips].sort((a, b) => {
    const idA = typeof a.id === 'string' ? parseInt(a.id) : Number(a.id);
    const idB = typeof b.id === 'string' ? parseInt(b.id) : Number(b.id);
    return idA - idB;
  });

  useEffect(() => {
    if (segmentsData) {
      setSubTrips(segmentsData);

      const firstActive = segmentsData.find(
        (s) => s.segment_status === "pending" || s.segment_status === "in_progress"
      );
      if (firstActive) {
        setExpandedId(firstActive.id);
      }
    }
  }, [segmentsData]);

useEffect(() => {
    if (open && localTrip && (localTrip.status === "fuel_pending" || localTrip.status === "completed")) {
        setEditFormData({
            general_initial_km: localTrip.initialKm?.toString() || "",
            general_final_km: localTrip.finalKm?.toString() || "",
            segments: {},
        });
        
        // Inicializar datos de segmentos usando subTrips directamente, no sortedSubTrips
        const segmentsData: Record<string, { initial: string; final: string }> = {};
        
        // Usar subTrips en lugar de sortedSubTrips para evitar la dependencia
        // Ordenamos aquí mismo sin crear una nueva referencia
        const sorted = [...subTrips].sort((a, b) => {
            const idA = typeof a.id === 'string' ? parseInt(a.id) : Number(a.id);
            const idB = typeof b.id === 'string' ? parseInt(b.id) : Number(b.id);
            return idA - idB;
        });
        
        sorted.forEach((sub) => {
            segmentsData[sub.id] = {
                initial: sub.initial_mileage?.toString() || "",
                final: sub.final_mileage?.toString() || "",
            };
        });
        setEditFormData(prev => ({ ...prev, segments: segmentsData }));
    }
}, [open, localTrip, subTrips]);

const handleEditFieldChange = (field: 'general_initial_km' | 'general_final_km', value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setEditFormData(prev => ({ ...prev, [field]: sanitized }));
};

const handleEditSegmentChange = (segmentId: string, field: 'initial' | 'final', value: string) => {
    const sanitized = value.replace(/[^0-9.]/g, '');
    setEditFormData(prev => ({
        ...prev,
        segments: {
            ...prev.segments,
            [segmentId]: {
                ...prev.segments[segmentId],
                [field]: sanitized,
            }
        }
    }));
};

const getSegmentWarnings = () => {
    const warnings: string[] = [];
    const segments = sortedSubTrips.map((sub, idx) => ({
        id: sub.id,
        name: sub.name,
        initial: parseFloat(editFormData.segments[sub.id]?.initial || ''),
        final: parseFloat(editFormData.segments[sub.id]?.final || ''),
        index: idx,
    }));
    
    // Verificar cada tramo
    for (const seg of segments) {
        if (!isNaN(seg.initial) && !isNaN(seg.final) && seg.final <= seg.initial) {
            warnings.push(`Tramo ${seg.index + 1}: km final debe ser mayor al inicial`);
        }
    }
    
    // Verificar contigüidad
    for (let i = 0; i < segments.length - 1; i++) {
        const current = segments[i];
        const next = segments[i + 1];
        if (!isNaN(current.final) && !isNaN(next.initial) && current.final > next.initial) {
            warnings.push(`Tramo ${i + 1} y ${i + 2}: el km final del tramo ${i + 1} (${current.final}) es mayor al km inicial del tramo ${i + 2} (${next.initial})`);
        }
    }
    
    return warnings;
};

const handleSaveMileageEdits = async () => {
    if (!localTrip) return;
    
    // Obtener valores
    const generalInitial = parseFloat(editFormData.general_initial_km);
    const generalFinal = parseFloat(editFormData.general_final_km);
    
    // Preparar datos de segmentos ordenados
    const segmentsList = sortedSubTrips.map(sub => ({
        id: sub.id,
        name: sub.name,
        initial: editFormData.segments[sub.id]?.initial ? parseFloat(editFormData.segments[sub.id].initial) : null,
        final: editFormData.segments[sub.id]?.final ? parseFloat(editFormData.segments[sub.id].final) : null,
        originalInitial: sub.initial_mileage,
        originalFinal: sub.final_mileage,
    }));
    
    const firstSegment = segmentsList[0];
    const lastSegment = segmentsList[segmentsList.length - 1];
    
    // ========== VALIDACIONES FRONTEND ==========
    
    // 1. Validar km inicial general vs primer tramo
    if (firstSegment && !isNaN(generalInitial) && firstSegment.initial !== null) {
        if (firstSegment.initial < generalInitial) {
            errorToast(
                `El kilometraje inicial del primer tramo (${firstSegment.initial} km) ` +
                `no puede ser menor al kilometraje inicial general (${generalInitial} km)`
            );
            return;
        }
    }
    
    // 2. Validar km final general vs último tramo
    if (lastSegment && !isNaN(generalFinal) && lastSegment.final !== null) {
        if (lastSegment.final > generalFinal) {
            errorToast(
                `El kilometraje final del último tramo (${lastSegment.final} km) ` +
                `no puede ser mayor al kilometraje final general (${generalFinal} km)`
            );
            return;
        }
    }
    
    // 3. Validar que km final general sea mayor al inicial
    if (!isNaN(generalInitial) && !isNaN(generalFinal)) {
        if (generalFinal <= generalInitial) {
            errorToast("El kilometraje final general debe ser mayor al inicial");
            return;
        }
    }
    
    // 4. Validar que primer tramo inicial no sea mayor al último tramo final
    if (firstSegment && lastSegment && 
        firstSegment.initial !== null && lastSegment.final !== null) {
        if (firstSegment.initial > lastSegment.final) {
            errorToast(
                `El kilometraje inicial del primer tramo (${firstSegment.initial} km) ` +
                `no puede ser mayor al kilometraje final del último tramo (${lastSegment.final} km)`
            );
            return;
        }
    }
    
    // 5. Validar que los tramos sean contiguos (km final <= km inicial del siguiente)
    for (let i = 0; i < segmentsList.length - 1; i++) {
        const current = segmentsList[i];
        const next = segmentsList[i + 1];
        
        if (current.final !== null && next.initial !== null) {
            if (current.final > next.initial) {
                errorToast(
                    `Inconsistencia entre tramos: El km final del tramo "${current.name}" ` +
                    `(${current.final} km) no puede ser mayor al km inicial del siguiente tramo ` +
                    `"${next.name}" (${next.initial} km)`
                );
                return;
            }
        }
    }
    
    // 6. Validar que cada tramo tenga km final > km inicial
    for (const segment of segmentsList) {
        if (segment.initial !== null && segment.final !== null) {
            if (segment.final <= segment.initial) {
                errorToast(
                    `El kilometraje final del tramo "${segment.name}" (${segment.final} km) ` +
                    `debe ser mayor al inicial (${segment.initial} km)`
                );
                return;
            }
        }
    }
    
    // ========== CONTINUAR CON EL ENVÍO ==========
    
    // Preparar datos de segmentos para el backend
    const segmentsData = [];
    for (const sub of sortedSubTrips) {
        const segmentData = editFormData.segments[sub.id];
        if (segmentData) {
            const initial = segmentData.initial ? parseFloat(segmentData.initial) : null;
            const final = segmentData.final ? parseFloat(segmentData.final) : null;
            
            segmentsData.push({
                id: sub.id,
                initial_mileage: initial,
                final_mileage: final,
            });
        }
    }
    
    try {
        const updatedTravel = await updateMileage({
            id: localTrip.id,
            general_initial_km: editFormData.general_initial_km ? parseFloat(editFormData.general_initial_km) : null,
            general_final_km: editFormData.general_final_km ? parseFloat(editFormData.general_final_km) : null,
            segments: segmentsData,
        });
        
        setLocalTrip(updatedTravel);
        setIsEditingMileage(false);
        
        successToast("Kilometrajes actualizados correctamente");
    } catch (error: any) {
        errorToast(error.message || "Error al actualizar los kilometrajes");
    }
};
  const handleExport = (format: 'excel' | 'pdf') => {
    if(localTrip){
      exportReport({ travelId: localTrip.id, format});
    }
  }

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



  const startStopwatch = useStopwatch(getStartTime());
  const endStopwatch = useStopwatch(endTime);

  // Funciones auxiliares para SubTrips
  const setKm = (id: string, field: "initial" | "final", value: string) => {
    setKmInputs((prev) => ({ ...prev, [`${id}-${field}`]: value }));
    // Limpiar error cuando se modifica
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: "" }));
    }
  };

  const getKm = (id: string, field: "initial" | "final") =>
    kmInputs[`${id}-${field}`] ?? "";

  const getMinInitialKm = (sub: SubTrip): number | undefined => {

    const sorted = [...subTrips].sort((a, b) => {
      const idA = typeof a.id === 'string' ? parseInt(a.id) : Number(a.id);
      const idB = typeof b.id === 'string' ? parseInt(b.id) : Number(b.id);
      return idA - idB;
    });

    const currentIndex = sorted.findIndex(s => s.id === sub.id);
    const prevSubTrip = sorted[currentIndex - 1];

    if (prevSubTrip?.final_mileage) return prevSubTrip.final_mileage;
    return localTrip?.previousFinalKm;
  };

  // Helper para convertir string a Date o null
  const parseDate = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  };

  // Helper para formatear fecha a string local
  const formatTime = (dateStr: string | null | undefined): string => {
    const date = parseDate(dateStr);
    if (!date) return "-";
    return date.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleStartSubTrip = async (sub: SubTrip) => {
    const initialStr = getKm(sub.id, "initial") || (sub.initial_mileage ? sub.initial_mileage.toString() : "");
    const initial = parseFloat(initialStr);
    const min = getMinInitialKm(sub) || 0;

    if (isNaN(initial)) {
      setErrors((p) => ({ ...p, [sub.id]: "Ingrese el kilometraje inicial" }));
      return;
    }
    if (min !== undefined && initial < min) {
      setErrors((p) => ({
        ...p,
        [sub.id]: `El km inicial no puede ser menor a ${min} km`,
      }));
      return;
    }
    setErrors((p) => ({ ...p, [sub.id]: "" }));

    try {
      const now = new Date().toISOString();

      let location = null;
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.warn("No se pudo obtener la ubicación");
      }


      await startSegmentMutation({
        travelId: localTrip!.id,
        segmentId: sub.id,
        mileage: initial,
        latitude: location?.latitude,
        longitude: location?.longitude,
      });

      // Actualizar SubTrip en backend
      const updatedSubTrips = subTrips.map((s) =>
        s.id === sub.id
          ? {
            ...s,
            status: "in_progress" as SubTripStatus,
            initial_mileage: initial,
            actual_start: now,
            start_latitude: location?.latitude ?? null, 
            start_longitude: location?.longitude ?? null, 
          }
          : s
      );

      setSubTrips(updatedSubTrips);


      const sorted = [...updatedSubTrips].sort((a, b) => {
        const idA = typeof a.id === 'string' ? parseInt(a.id) : Number(a.id);
        const idB = typeof b.id === 'string' ? parseInt(b.id) : Number(b.id);
        return idA - idB;
      });

      const firstSubTrip = sorted[0];
      const isFirstSubTrip = firstSubTrip?.id === sub.id;

      // Si es el primer SubTrip, iniciar el viaje general
      if (isFirstSubTrip && localTrip?.status === "pending") {
        const updatedTrip = await startRouteMutation({
          id: localTrip.id,
          mileage: initial,
          notes: "Inicio de Ruta - Primer tramo",
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
        startStopwatch.start();

        if (onStatusChange) {
          onStatusChange(localTrip.id, "in_progress");
        }
      }

      successToast(`${sub.name} iniciado`, `Kilometraje inicial: ${initial} km`);
    } catch (error: any) {
      console.error("Error al iniciar tramo:", error);
      errorToast(error.message || "Error al iniciar el tramo");
    }
  };

  const handleEndSubTrip = async (sub: SubTrip) => {
    const finalStr = getKm(sub.id, "final");
    const final = parseFloat(finalStr);
    const initial = sub.initial_mileage ?? 0;

    if (isNaN(final)) {
      setErrors((p) => ({ ...p, [sub.id]: "Ingrese el kilometraje final" }));
      return;
    }
    if (final <= initial) {
      setErrors((p) => ({
        ...p,
        [sub.id]: `El km final debe ser mayor a ${initial} km`,
      }));
      return;
    }
    setErrors((p) => ({ ...p, [sub.id]: "" }));

    try {
      const now = new Date();
      const nowISO = now.toISOString();
      const startDate = parseDate(sub.actual_start);
      const totalKm = final - initial;
      const totalHours = startDate
        ? (now.getTime() - startDate.getTime()) / (1000 * 60 * 60)
        : 0;

      let location = null;
      try {
        location = await getCurrentLocation();
      } catch (error) {
        console.warn("No se pudo obtener la ubicación");
      }

      const result = await endSegmentMutation({
        travelId: localTrip!.id,
        segmentId: sub.id,
        mileage: final,
        latitude: location?.latitude,
        longitude: location?.longitude,
        tonnage: tonnageValue ? parseFloat(tonnageValue) : undefined,
      });

      // let updatedSubTrips = subTrips.map((s) =>
      //   s.id === sub.id
      //     ? {
      //       ...s,
      //       status: "completed" as SubTripStatus,
      //       final_mileage: final,
      //       total_mileage: totalKm,
      //       total_hours: parseFloat(totalHours.toFixed(2)),
      //       actual_end: nowISO,
      //       end_latitude: location?.latitude ?? null,
      //       end_longitude: location?.longitude ?? null,
      //     }
      //     : s
      // );

      let updatedSubTrips = subTrips.map((s) => {
        if(s.id === sub.id){
          return {
            ...s,
            status: 'completed' as SubTripStatus,
            final_mileage: final,
            total_mileage: totalKm,
            total_hours: parseFloat(totalHours.toFixed(2)),
            actual_end: nowISO,
            end_latitude: location?.latitude ?? null,
            end_longitude: location?.longitude ?? null,
          };
        }

        //actualizar el siguiente tramo con el km inicial automatico
        const idA = typeof s.id === 'string' ? parseInt(s.id) : Number(s.id);
        const idB = typeof sub.id === 'string' ? parseInt(sub.id) : Number(sub.id);
        if(idA > idB && s.initial_mileage === null){
          return {
            ...s,
            initial_mileage: final, // Asignar el km final del tramo actual
          };
        }

        return s;
      });

      const sorted = [...updatedSubTrips].sort((a, b) => {
        const idA = typeof a.id === 'string' ? parseInt(a.id) : Number(a.id);
        const idB = typeof b.id === 'string' ? parseInt(b.id) : Number(b.id);
        return idA - idB;
      });

      const currentIndex = sorted.findIndex(s => s.id === sub.id);
      const nextSubTrip = sorted[currentIndex + 1];

      if (nextSubTrip && nextSubTrip.status === "locked") {
        updatedSubTrips = updatedSubTrips.map((s) =>
          s.id === nextSubTrip.id
            ? { ...s, status: "pending" as SubTripStatus }
            : s
        );
      }


      setSubTrips(updatedSubTrips);

      // Expandir el siguiente SubTrip si existe
      const next = updatedSubTrips.find((s) => {
        const idA = typeof s.id === 'string' ? parseInt(s.id) : Number(s.id);
        const idB = typeof sub.id === 'string' ? parseInt(sub.id) : Number(sub.id);
        return idA > idB && s.status === "pending";
      }
      );

      if (next) {
        setExpandedId(next.id);
      }

      const allCompleted = result.all_completed || updatedSubTrips.every((s) => s.status === "completed");


      if (allCompleted && localTrip?.status === "in_progress") {
        const safeUpdatedTrip = {
          ...localTrip,
          status: "fuel_pending" as TripStatus,
          finalkm: final,
          totalKm: localTrip.totalKm || totalKm,
          totalHours: localTrip.totalHours || totalHours,
          tonnage: tonnageValue ? parseFloat(tonnageValue) : localTrip.tonnage,
        };

        setLocalTrip(safeUpdatedTrip);
        setEndTime(now);
        startStopwatch.stop();

        if (onStatusChange) {
          onStatusChange(localTrip.id, "fuel_pending");
        }

        successToast(
          "¡Viaje completado!",
          `Total: ${safeUpdatedTrip.totalKm || 0} km en ${safeUpdatedTrip.totalHours?.toFixed(2) || "0.00"} horas`
        );

      } else {
        successToast(
          `${sub.name} completado`,
          next ? `Siguiente: ${next.name} desbloqueado` : "Todos los tramos completados"
        );
      }
    } catch (error: any) {
      console.error("Error al finalizar tramo:", error);
      errorToast(error.message || "Error al finalizar el tramo");
    }
  };

  const handleSavingFuel = async () => {
    const isValid = await triggerValidation("factorKm");

    if (!isValid) {
      errorToast(
        formErrors.factorKm?.message || "Por favor, corrige el factor KM.",
      );
      return;
    }

    const formData = getValues();
    await handleSaveFuel(formData);
  };

  const handleSaveFuel = async (data: TravelControlModalData) => {
    if (!localTrip) {
      errorToast("No hay viaje seleccionado");
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

      successToast(
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

  const isDriver = (userComplete?.position?.toUpperCase() === 'CONDUCTOR DE TRACTO CAMION') ||
    (userComplete?.position?.toUpperCase() === 'INSTRUCTOR DE FLOTA');
  const isComercial = (userComplete?.role?.toUpperCase() === 'COMERCIAL Y FACTURACION TP') ||
    (userComplete?.position?.toUpperCase() === 'ASISTENTE DE OPERACIONES');
  const userCanEditMileage = canUpdate && !isDriver;

  const allSubTripsCompleted = subTrips.length > 0 && subTrips.every((s) => s.status === "completed");
  const hasSubTrips = subTrips.length > 0;

  if (!localTrip) {
    return <>{trigger}</>;
  }

  const completedCount = sortedSubTrips.filter((s) => s.status === "completed").length;

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
                disabled={
                  formSubmitting ||
                  isStartingRoute ||
                  isEndingRoute ||
                  isRegisteringFuel
                }
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              {/* Botón de exportación */}
              {(localTrip.status === "fuel_pending" || localTrip.status === "completed") && canExport && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2" disabled={isExporting}>
                      {isExporting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleExport('excel')}>
                       Exportar a Excel
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExport('pdf')}>
                      Exportar a PDF
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            <div className="flex justify-end">
              <Badge
                variant="outline"
                className={cn(
                  "capitalize gap-2",
                  localTrip.status === "pending" &&
                  "bg-yellow-50 border-yellow-200 text-yellow-800",
                  localTrip.status === "in_progress" &&
                  "bg-green-50 border-green-200 text-green-800",
                  localTrip.status === "completed" &&
                  "bg-blue-50 border-blue-200 text-blue-800",
                  localTrip.status === "fuel_pending" &&
                  "bg-orange-50 border-orange-200 text-orange-800",
                )}
              >
                {localTrip.status === "pending" && <Clock className="size-3" />}
                {localTrip.status === "in_progress" && (
                  <Play className="size-3" />
                )}
                {localTrip.status === "completed" && (
                  <CheckCircle className="size-3" />
                )}
                {localTrip.status === "fuel_pending" && (
                  <Fuel className="size-3" />
                )}
                {localTrip.status === "pending" && "Pendiente"}
                {localTrip.status === "in_progress" && "En Ruta"}
                {localTrip.status === "completed" && "Completado"}
                {localTrip.status === "fuel_pending" && "Combustible Pendiente"}
              </Badge>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Información del Viaje</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={Truck}
                  label="Placa"
                  value={localTrip.plate || "Sin placa"}
                />
                <InfoItem
                  icon={User}
                  label="Conductor"
                  value={localTrip.driver?.name || "Sin Conductor"}
                />
                <InfoItem
                  icon={MapPin}
                  label="Ruta"
                  value={localTrip.route || "Sin Ruta"}
                />
                <InfoItem
                  icon={Package}
                  label="Cliente"
                  value={localTrip.client || "Sin cliente"}
                />
              </div>
            </div>

            {/* Stopwatch cuando el viaje está en progreso */}
            {localTrip.status === "in_progress" && localTrip.startTime && (
              <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
                <div className="flex items-center gap-3 p-3 bg-success/10 rounded-lg mb-3">
                  <Clock className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Viaje iniciado</p>
                    <p className="text-xs text-muted-foreground">
                      {getStartTime()?.toLocaleString("es-PE") || "N/A"} • {localTrip.initialKm} km
                    </p>
                  </div>
                </div>
                <StopwatchDisplay
                  time={startStopwatch.formattedTime}
                  label="Tiempo en ruta"
                  variant="start"
                  isRunning={startStopwatch.isRunning}
                />
              </div>
            )}

            {/* Lista de SubTrips */}
            {hasSubTrips && (localTrip.status === "pending" || localTrip.status === "in_progress") && (
              <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    Tramos del Viaje
                  </h2>
                  <span className="text-xs text-muted-foreground">
                    {completedCount} / {sortedSubTrips.length} completados
                  </span>
                </div>

                <div className="space-y-3">
                  {sortedSubTrips.map((sub, index) => {
                    const currentStatus = sub.segment_status || sub.status || 'pending';
                    const tramoNumber = index + 1;
                    const isLocked = currentStatus === "locked";
                    const isCompleted = currentStatus === "completed";
                    const isActive = currentStatus === "in_progress";
                    const isPending = currentStatus === "pending";
                    const isExpanded = expandedId === sub.id;
                    const error = errors[sub.id];
                    const minKm = getMinInitialKm(sub);
                    const startTimeFormatted = formatTime(sub.actual_start);
                    const displayInitialKm = sub.initial_mileage;
                    const displayFinalKm = sub.final_mileage;
                    const displayTotalKm = sub.total_mileage;
                    const displayTotalHours = sub.total_hours;
                    const isFirstTrip = sub.order === 1;
                    const hasPreloadedMileage = sub.initial_mileage !== null && sub.initial_mileage !== undefined;

                    return (
                      <div
                        key={sub.id}
                        className={cn(
                          "border rounded-lg transition-all",
                          isLocked && "border-border/50 bg-muted/30 opacity-60",
                          isPending && "border-primary/30 bg-primary/5",
                          isActive && "border-green-500/40 bg-green-500/5",
                          isCompleted && "border-green-500/30 bg-green-500/5"
                        )}
                      >
                        <button
                          onClick={() => !isLocked && setExpandedId(isExpanded ? null : sub.id)}
                          disabled={isLocked}
                          className="w-full p-3 flex items-center gap-3 text-left"
                        >
                          <div
                            className={cn(
                              "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                              isLocked && "bg-muted text-muted-foreground",
                              isPending && "bg-primary/20 text-primary",
                              isActive && "bg-green-500/20 text-green-600 animate-pulse",
                              isCompleted && "bg-green-500 text-white"
                            )}
                          >
                            {isLocked && <Lock className="h-4 w-4" />}
                            {isPending && <span className="text-sm font-bold">{tramoNumber}</span>}
                            {isActive && <Play className="h-4 w-4" />}
                            {isCompleted && <CheckCircle className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{sub.name}</p>
                            <p className="text-xs text-muted-foreground truncate">
                              {sub.origin} → {sub.destination}
                            </p>
                            {sub.km_viaje && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Distancia estimada: {sub.km_viaje} km
                              </p>
                            )}
                          </div>
                          {!isLocked &&
                            (isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ))}
                        </button>

                        {!isLocked && isExpanded && (
                          <div className="px-3 pb-3 space-y-3 border-t border-border/50 pt-3">
                            {error && (
                              <div className="flex items-start gap-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <span>{error}</span>
                              </div>
                            )}

                            {/* Pending: capturar km inicial */}
                            {isPending && isDriver && (
                              <>
                                <div>
                                  <Label htmlFor={`init-${sub.id}`} className="text-xs">
                                    Kilometraje Inicial
                                  </Label>
                                  <div className="relative mt-1">
                                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    {/* <Input
                                      id={`init-${sub.id}`}
                                      type="number"
                                      step="1"
                                      placeholder={minKm ? `Mínimo: ${minKm} km` : "Km inicial"}
                                      value={getKm(sub.id, "initial")}
                                      onChange={(e) => setKm(sub.id, "initial", e.target.value)}
                                      className="pl-10 h-10"
                                    /> */}
                                    <Input
                                      id={`init-${sub.id}`}
                                      type="number"
                                      step="1"
                                      placeholder={minKm ? `Mínimo: ${minKm} km` : "Km inicial"}
                                      value={getKm(sub.id, "initial") || (sub.initial_mileage ? Number(sub.initial_mileage).toString() : "")}
                                      onChange={(e) => setKm(sub.id, "initial", e.target.value)}
                                      className={
                                        cn(
                                          "pl-10 h-10",
                                          (!isFirstTrip && hasPreloadedMileage) && "bg-muted text-muted-foreground cursor-not-allowed"
                                        )
                                      }/>
                                  </div>
                                  {minKm !== undefined && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Último registro: {minKm} km
                                    </p>
                                  )}
                                </div>
                                <Button
                                  onClick={() => handleStartSubTrip(sub)}
                                  disabled={!getKm(sub.id, "initial") && !sub.initial_mileage}
                                  className="w-full bg-green-600 hover:bg-green-700"
                                >
                                  <Play className="h-4 w-4 mr-2" />
                                  Iniciar Tramo
                                </Button>
                              </>
                            )}

                            {/* In progress: mostrar inicio + capturar fin */}
                            {isActive && (
                              <>
                                <div className="flex items-center gap-2 p-2 bg-card rounded text-xs">
                                  <Clock className="h-3.5 w-3.5 text-green-600" />
                                  <span className="text-muted-foreground">Iniciado:</span>
                                  <span className="font-medium">{startTimeFormatted}</span>
                                  <span className="text-muted-foreground">•</span>
                                  <span className="font-medium">{displayInitialKm} km</span>
                                </div>
                                {isDriver && (
                                  <>
                                    <div>
                                      <Label htmlFor={`end-${sub.id}`} className="text-xs">
                                        Kilometraje Final
                                      </Label>
                                      <div className="relative mt-1">
                                        <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                          id={`end-${sub.id}`}
                                          type="number"
                                          step="1"
                                          placeholder={`Mayor a: ${sub.initial_mileage} km`}
                                          value={getKm(sub.id, "final")}
                                          onChange={(e) => setKm(sub.id, "final", e.target.value)}
                                          className="pl-10 h-10"
                                        />
                                      </div>
                                    </div>
                                    <Button
                                      onClick={() => handleEndSubTrip(sub)}
                                      disabled={!getKm(sub.id, "final")}
                                      className="w-full bg-red-600 hover:bg-red-700"
                                    >
                                      <Square className="h-4 w-4 mr-2" />
                                      Finalizar Tramo
                                    </Button>
                                  </>
                                )}
                              </>
                            )}

                            {/* Completed: mostrar resumen */}
                            {isCompleted && (
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="p-2 bg-muted rounded">
                                  <p className="text-muted-foreground">Km Inicial</p>
                                  <p className="font-semibold">{displayInitialKm}</p>
                                </div>
                                <div className="p-2 bg-muted rounded">
                                  <p className="text-muted-foreground">Km Final</p>
                                  <p className="font-semibold">{displayFinalKm}</p>
                                </div>
                                <div className="p-2 bg-muted rounded">
                                  <p className="text-muted-foreground">Total Km</p>
                                  <p className="font-semibold text-green-600">{displayTotalKm}</p>
                                </div>
                                <div className="p-2 bg-muted rounded">
                                  <p className="text-muted-foreground">Total Horas</p>
                                  <p className="font-semibold text-green-600">
                                    {
                                      displayTotalHours !== null && displayTotalHours !== undefined
                                        ? Number(displayTotalHours).toFixed(2)
                                        : '-'

                                    }</p>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Finalizar Viaje General - Solo cuando todos los SubTrips están completados */}
            {localTrip.status === "in_progress" && allSubTripsCompleted && isDriver && (
              <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
                <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Square className="h-4 w-4 text-destructive" />
                  Finalizar Viaje General
                </h2>
                <div className="space-y-4">
                  <FormInput
                    control={control}
                    name="tonnage"
                    label="Toneladas Transportadas (opcional)"
                    type="text"
                    inputMode="decimal"
                    placeholder="Ej: 25"
                    addonStart={<Package className="h-4 w-4 text-gray-500" />}
                    className="pl-10"
                    disabled={formSubmitting || isEndingRoute}
                    error={formErrors.tonnage?.message}
                    onChange={handleInputChange("tonnage")}
                  />
                  <Button
                    onClick={() => {
                      const lastSub = sortedSubTrips[sortedSubTrips.length - 1];
                      if (lastSub.status === "completed") {
                        handleEndSubTrip(lastSub);
                      }
                    }}
                    className="w-full bg-destructive hover:bg-destructive/90"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Finalizar Viaje General
                  </Button>
                </div>
              </div>
            )}

            {/* Stopwatch Display para End Time */}
            {endTime && (localTrip.status === "completed" || localTrip.status === "fuel_pending") && (
              <StopwatchDisplay
                time={endStopwatch.formattedTime}
                label="Tiempo desde finalización"
                variant="end"
                isRunning={endStopwatch.isRunning}
              />
            )}

            {/* Métricas del Viaje */}
            {(localTrip.status === "fuel_pending" || localTrip.status === "completed") && (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-lg">Métricas del Viaje</h3>
                    {userCanEditMileage && (
                      !isEditingMileage ? (
                          <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIsEditingMileage(true)}
                              className="gap-2"
                              disabled={isUpdatingMileage}
                          >
                              <Pencil className="h-4 w-4" />
                              Editar Kilometrajes
                          </Button>
                      ) : (
                          <div className="flex gap-2">
                              <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setIsEditingMileage(false)}
                                  disabled={isUpdatingMileage}
                              >
                                  <X className="h-4 w-4 mr-1" />
                                  Cancelar
                              </Button>
                              <Button
                                  variant="default"
                                  size="sm"
                                  onClick={handleSaveMileageEdits}
                                  disabled={isUpdatingMileage}
                                  className="gap-2"
                              >
                                  {isUpdatingMileage ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                      <Save className="h-4 w-4" />
                                  )}
                                  Guardar Cambios
                              </Button>
                          </div>
                      )
                  )}
                </div>

                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {!isEditingMileage || !userCanEditMileage ? (
                        // Modo vista - mostrar valores actuales
                        <>
                            <MetricCard label="Km Inicial" value={localTrip.initialKm?.toString() || "-"} subtext="km" />
                            <MetricCard label="Km Final" value={localTrip.finalKm?.toString() || "-"} subtext="km" />
                            <MetricCard label="Total Km" value={localTrip.totalKm?.toString() || "-"} subtext="km" />
                            <MetricCard label="Horas Totales" value={localTrip.totalHours?.toFixed(2) || "-"} subtext="horas" />
                            {localTrip.tonnage && (
                                <MetricCard label="Toneladas" value={localTrip.tonnage.toString()} subtext="ton" />
                            )}
                        </>
                    ) : (
                        // Modo edición - inputs para editar
                        <>
                            <div>
                                <Label className="text-xs">Km Inicial General</Label>
                                <div className="relative mt-1">
                                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        step="1"
                                        value={editFormData.general_initial_km}
                                        onChange={(e) => handleEditFieldChange('general_initial_km', e.target.value)}
                                        className="pl-10"
                                        placeholder="Km inicial"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs">Km Final General</Label>
                                <div className="relative mt-1">
                                    <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        type="number"
                                        step="1"
                                        value={editFormData.general_final_km}
                                        onChange={(e) => handleEditFieldChange('general_final_km', e.target.value)}
                                        className="pl-10"
                                        placeholder="Km final"
                                    />
                                </div>
                            </div>
                            <div>
                                <Label className="text-xs">Total Km (automático)</Label>
                                <div className="p-3 bg-muted rounded-lg text-center">
                                    <span className="font-bold text-lg">
                                        {(() => {
                                            const initial = parseFloat(editFormData.general_initial_km);
                                            const final = parseFloat(editFormData.general_final_km);
                                            if (!isNaN(initial) && !isNaN(final) && final > initial) {
                                                return `${(final - initial).toFixed(0)} km`;
                                            }
                                            return localTrip.totalKm ? `${localTrip.totalKm} km` : "-";
                                        })()}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {isEditingMileage && userCanEditMileage && (() => {
                  const warnings = getSegmentWarnings();
                  if (warnings.length > 0) {
                      return (
                          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-700 space-y-1">
                              {warnings.map((w, i) => (
                                  <p key={i} className="flex items-center gap-1">
                                      <AlertCircle className="h-3 w-3" />
                                      {w}
                                  </p>
                              ))}
                          </div>
                      );
                  }
                  return null;
                })()}
            </div>
        )}

            {/* Métricas por Tramo */}
            {(localTrip.status === "fuel_pending" || localTrip.status === "completed") && sortedSubTrips.length > 0 && (
              <div className="bg-card rounded-xl p-4 shadow-card border border-border/50">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Métricas por Tramo
                        {isEditingMileage && userCanEditMileage && (
                            <Badge variant="outline" className="ml-2 text-xs">
                                <Edit3 className="h-3 w-3 mr-1" />
                                Modo edición
                            </Badge>
                        )}
                    </h2>
                </div>

                <div className="space-y-3">
                    {sortedSubTrips.map((sub, index) => {
                        const tramoNumber = index + 1;
                        const isCompleted = sub.status === "completed";
                        const segmentData = editFormData.segments[sub.id];
                        
                        // Calcular total automático si está en modo edición
                        let autoTotalKm = null;
                        if (isEditingMileage && segmentData) {
                            const initial = parseFloat(segmentData.initial);
                            const final = parseFloat(segmentData.final);
                            if (!isNaN(initial) && !isNaN(final) && final > initial) {
                                autoTotalKm = final - initial;
                            }
                        }

                        return (
                            <div key={sub.id} className="border border-border/50 rounded-lg p-3 bg-muted/30">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-semibold text-foreground">
                                            Tramo {tramoNumber}: {sub.origin} - {sub.destination}
                                        </p>
                                    </div>
                                    <span className={cn(
                                        "text-xs px-2 py-0.5 rounded-full",
                                        isCompleted ? "bg-green-500/15 text-green-600" : "bg-muted text-muted-foreground"
                                    )}>
                                        {isCompleted ? "Completado" : "Sin Completar"}
                                    </span>
                                </div>

                                {!isEditingMileage && (
                                    // Modo vista
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="p-2 bg-card rounded">
                                            <p className="text-muted-foreground">Km Inicial</p>
                                            <p className="font-semibold">{sub.initial_mileage ?? '-'}</p>
                                        </div>
                                        <div className="p-2 bg-card rounded">
                                            <p className="text-muted-foreground">Km Final</p>
                                            <p className="font-semibold">{sub.final_mileage ?? '-'}</p>
                                        </div>
                                        <div className="p-2 bg-card rounded">
                                            <p className="text-muted-foreground">Total Km</p>
                                            <p className="font-semibold text-green-600">{sub.total_mileage ?? '-'}</p>
                                        </div>
                                    </div>
                                )}
                                
                                { isEditingMileage && userCanEditMileage && (
                                    // Modo edición
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-xs">Km Inicial</Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={segmentData?.initial || ""}
                                                onChange={(e) => handleEditSegmentChange(sub.id, 'initial', e.target.value)}
                                                className="mt-1 h-9 text-sm"
                                                placeholder="Km inicial"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs">Km Final</Label>
                                            <Input
                                                type="number"
                                                step="1"
                                                value={segmentData?.final || ""}
                                                onChange={(e) => handleEditSegmentChange(sub.id, 'final', e.target.value)}
                                                className="mt-1 h-9 text-sm"
                                                placeholder="Km final"
                                            />
                                        </div>
                                        <div className="bg-primary/5 rounded-lg p-2 text-center">
                                            <p className="text-xs text-muted-foreground">Total Km</p>
                                            <p className={cn(
                                                "font-bold text-sm",
                                                autoTotalKm !== null ? "text-green-600" : "text-muted-foreground"
                                            )}>
                                                {autoTotalKm !== null ? `${autoTotalKm.toFixed(0)} km` : (sub.total_mileage ?? '-')}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {isEditingMileage && !userCanEditMileage && (
                                <div className="grid grid-cols-3 gap-2 text-xs opacity-75">
                                  <div className="p-2 bg-card rounded">
                                    <p className="text-muted-foreground">Km Inicial</p>
                                    <p className="font-semibold">{sub.initial_mileage ?? '-'}</p>
                                  </div>
                                  <div className="p-2 bg-card rounded">
                                    <p className="text-muted-foreground">Km Final</p>
                                    <p className="font-semibold">{sub.final_mileage ?? '-'}</p>
                                  </div>
                                  <div className="p-2 bg-card rounded">
                                    <p className="text-muted-foreground">Total Km</p>
                                    <p className="font-semibold text-green-600">{sub.total_mileage ?? '-'}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                        );
                    })}
                </div>
              </div>
              )}


            {/* Registro de Combustible */}
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
                  error={formErrors.factorKm?.message}
                  disabled={formSubmitting || isRegisteringFuel}
                  onChange={handleInputChange("factorKm")}
                />

                {factorKmValue && localTrip.totalKm && (
                  <div className="p-4 bg-white rounded-lg border">
                    <p className="text-sm text-gray-600">Monto Calculado</p>
                    <p className="text-2xl font-bold">
                      S/{" "}
                      {(
                        parseFloat(factorKmValue) * (localTrip.totalKm || 0)
                      ).toFixed(2)}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => handleSavingFuel()}
                  disabled={
                    !factorKmValue || !!formErrors.factorKm || isRegisteringFuel
                  }
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

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string | null | undefined;
}) {
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
    <div
      className={cn(
        "p-3 rounded-lg flex flex-col items-center justify-center text-center",
        highlight
          ? "bg-blue-600 text-white"
          : "bg-white border border-gray-200",
      )}
    >
      <p
        className={cn(
          "text-xs font-medium mb-1",
          highlight ? "text-blue-100" : "text-gray-600",
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "text-lg font-bold",
          highlight ? "text-white" : "text-gray-900",
        )}
      >
        {value}
      </p>
      {subtext && (
        <p
          className={cn(
            "text-xs mt-1",
            highlight ? "text-blue-100" : "text-gray-500",
          )}
        >
          {subtext}
        </p>
      )}
    </div>
  );
}