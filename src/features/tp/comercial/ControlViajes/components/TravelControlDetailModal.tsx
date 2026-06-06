"use client";

import { useState, useEffect, useMemo, useCallback, useRef, useReducer, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
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
  HelpCircle,
  Navigation,
  Loader2,
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
import { Download } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ========== TYPES ==========
type SubTripsState = {
  subTrips: SubTrip[];
  expandedId: string | null;
  kmInputs: Record<string, string>;
  errors: Record<string, string>;
};

type SubTripsAction =
  | { type: 'SET_SUB_TRIPS'; payload: SubTrip[] }
  | { type: 'UPDATE_SUB_TRIP'; payload: { id: string; updates: Partial<SubTrip> } }
  | { type: 'SET_EXPANDED'; payload: string | null }
  | { type: 'SET_KM_INPUT'; payload: { id: string; field: string; value: string } }
  | { type: 'SET_ERROR'; payload: { id: string; error: string } }
  | { type: 'CLEAR_ERROR'; payload: string }
  | { type: 'RESET_KM_INPUTS' };

// ========== REDUCER ==========
const subTripsReducer = (state: SubTripsState, action: SubTripsAction): SubTripsState => {
  switch (action.type) {
    case 'SET_SUB_TRIPS':
      return { ...state, subTrips: action.payload };
    case 'UPDATE_SUB_TRIP':
      return {
        ...state,
        subTrips: state.subTrips.map(sub =>
          sub.id === action.payload.id ? { ...sub, ...action.payload.updates } : sub
        ),
      };
    case 'SET_EXPANDED':
      return { ...state, expandedId: action.payload };
    case 'SET_KM_INPUT':
      return {
        ...state,
        kmInputs: {
          ...state.kmInputs,
          [`${action.payload.id}-${action.payload.field}`]: action.payload.value,
        },
      };
    case 'SET_ERROR':
      return { ...state, errors: { ...state.errors, [action.payload.id]: action.payload.error } };
    case 'CLEAR_ERROR':
      // eslint-disable-next-line no-case-declarations
      const newErrors = { ...state.errors };
      delete newErrors[action.payload];
      return { ...state, errors: newErrors };
    case 'RESET_KM_INPUTS':
      return { ...state, kmInputs: {}, errors: {} };
    default:
      return state;
  }
};

export function TravelControlDetailModal({
  trip,
  trigger,
  onStatusChange,
  permissions
}: TravelControlDetailModalProps) {
  const [open, setOpen] = useState(false);
  const [localTrip, setLocalTrip] = useState<TravelControlResource | null>(trip);
  const { user } = useAuthStore();
  const { data: userComplete } = useUserComplete(user.id);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const { data: lastMileage } = useLastMileage(
    localTrip?.tracto_id ? String(localTrip.tracto_id) : undefined,
  );
  const { data: segmentsData } = useSegments(localTrip?.id);
  const { canUpdate, canExport } = permissions;
  const [, startTransition] = useTransition();

  // Estado para loading de botones de tramos
  const [loadingSegmentId, setLoadingSegmentId] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<'start' | 'end' | null>(null);


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

  // ========== USE REDUCER PARA SUBTRIPS ==========
  const [state, dispatch] = useReducer(subTripsReducer, {
    subTrips: [],
    expandedId: null,
    kmInputs: {},
    errors: {},
  });

  const { subTrips, expandedId, kmInputs, errors } = state;

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

  const { mutateAsync: startRouteMutation } = useStartRoute();
  const { isPending: isEndingRoute } = useEndRoute();
  const { mutateAsync: registerFuelMutation, isPending: isRegisteringFuel } = useRegisterFuel();
  const { mutateAsync: startSegmentMutation } = useStartSegment();
  const { mutateAsync: endSegmentMutation } = useEndSegment();
  const { mutate: exportReport, isPending: isExporting } = useExportTravelReport();

  const tonnageValue = watch("tonnage");
  const factorKmValue = watch("factorKm");

  // ========== DATOS ==========
  const sortedSubTrips = useMemo(() => {
    if (!subTrips.length) return [];
    return [...subTrips].sort((a, b) => {
      const idA = typeof a.id === 'string' ? parseInt(a.id) : Number(a.id);
      const idB = typeof b.id === 'string' ? parseInt(b.id) : Number(b.id);
      return idA - idB;
    });
  }, [subTrips]);

  const completedCount = useMemo(() => {
    return sortedSubTrips.filter((s) => s.status === "completed").length;
  }, [sortedSubTrips]);

  const allSubTripsCompleted = useMemo(() => {
    return subTrips.length > 0 && subTrips.every((s) => s.status === "completed");
  }, [subTrips]);

  const hasSubTrips = useMemo(() => subTrips.length > 0, [subTrips]);

  // ========== CALLBACKS  ==========
  const updateSubTrips = useCallback((newSubTrips: SubTrip[]) => {
    startTransition(() => {
      dispatch({ type: 'SET_SUB_TRIPS', payload: newSubTrips });
    });
  }, []);

  const updateSingleSubTrip = useCallback((id: string, updates: Partial<SubTrip>) => {
    dispatch({ type: 'UPDATE_SUB_TRIP', payload: { id, updates } });
  }, []);

  const setExpandedIdCallback = useCallback((id: string | null) => {
    dispatch({ type: 'SET_EXPANDED', payload: id });
  }, []);

  const setKm = useCallback((id: string, field: "initial" | "final", value: string) => {
    dispatch({ type: 'SET_KM_INPUT', payload: { id, field, value } });
    if (errors[id]) {
      dispatch({ type: 'CLEAR_ERROR', payload: id });
    }
  }, [errors]);

  const getKm = useCallback((id: string, field: "initial" | "final") => {
    return kmInputs[`${id}-${field}`] ?? "";
  }, [kmInputs]);

  const setError = useCallback((id: string, error: string) => {
    dispatch({ type: 'SET_ERROR', payload: { id, error } });
  }, []);

  const resetKmInputs = useCallback(() => {
    dispatch({ type: 'RESET_KM_INPUTS' });
  }, []);

  // ========== REFS PARA CONTROLAR INICIALIZACIONES ==========
  const hasInitializedEditForm = useRef(false);
  const isMounted = useRef(true);

  // Efecto para segmentsData
  useEffect(() => {
    if (!segmentsData?.length) return;

    const timeoutId = setTimeout(() => {
      if (!isMounted.current) return;

      updateSubTrips(segmentsData);

      const firstActive = segmentsData.find(
        (s) => s.segment_status === "pending" || s.segment_status === "in_progress"
      );

      if (firstActive) {
        setExpandedIdCallback(firstActive.id);
      }
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [segmentsData, updateSubTrips, setExpandedIdCallback]);

  // Efecto para inicializar editFormData
  useEffect(() => {
    if (!open || !localTrip) {
      hasInitializedEditForm.current = false;
      return;
    }

    const shouldInitialize =
      (localTrip.status === "fuel_pending" || localTrip.status === "completed") &&
      !hasInitializedEditForm.current;

    if (!shouldInitialize) return;

    const timer = setTimeout(() => {
      if (!isMounted.current) return;

      const newFormData = {
        general_initial_km: localTrip.initialKm?.toString() || "",
        general_final_km: localTrip.finalKm?.toString() || "",
        segments: {},
      };

      const segmentsDataObj: Record<string, { initial: string; final: string }> = {};
      sortedSubTrips.forEach((sub) => {
        segmentsDataObj[sub.id] = {
          initial: sub.initial_mileage?.toString() || "",
          final: sub.final_mileage?.toString() || "",
        };
      });
      newFormData.segments = segmentsDataObj;

      setEditFormData(newFormData);
      hasInitializedEditForm.current = true;
    }, 100);

    return () => clearTimeout(timer);
  }, [open, localTrip?.status, localTrip?.initialKm, localTrip?.finalKm, sortedSubTrips]);

  // Resetear flag cuando cambia el viaje
  useEffect(() => {
    hasInitializedEditForm.current = false;
    resetKmInputs();
  }, [localTrip?.id, resetKmInputs]);

  // Limpiar estados cuando se cierra el modal
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        if (isMounted.current) {
          resetKmInputs();
          setExpandedIdCallback(null);
        }
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [open, resetKmInputs, setExpandedIdCallback]);

  // Cleanup al desmontar
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ========== FUNCIONES DE UTILIDAD ==========
  const getMinInitialKm = useCallback((sub: SubTrip): number | undefined => {
    const currentIndex = sortedSubTrips.findIndex(s => s.id === sub.id);
    const prevSubTrip = sortedSubTrips[currentIndex - 1];

    if (prevSubTrip?.final_mileage) return prevSubTrip.final_mileage;
    return localTrip?.previousFinalKm;
  }, [sortedSubTrips, localTrip?.previousFinalKm]);

  const parseDate = useCallback((dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr);
    } catch {
      return null;
    }
  }, []);

  const formatTime = useCallback((dateStr: string | null | undefined): string => {
    const date = parseDate(dateStr);
    if (!date) return "-";
    return date.toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [parseDate]);

  const getStartTime = useCallback((): Date | null => {
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
  }, [localTrip]);

  const startStopwatch = useStopwatch(getStartTime());
  const endStopwatch = useStopwatch(endTime);

  // ========== HANDLERS PRINCIPALES ==========
  const handleStartSubTrip = async (sub: SubTrip) => {
    if (loadingSegmentId === sub.id && loadingAction === 'start') return;

    setLoadingSegmentId(sub.id);
    setLoadingAction('start');

    const initialStr = getKm(sub.id, "initial") || (sub.initial_mileage ? sub.initial_mileage.toString() : "");
    const initial = parseFloat(initialStr);
    const min = getMinInitialKm(sub) || 0;

    if (isNaN(initial)) {
      setError(sub.id, "Ingrese el kilometraje inicial");
      setLoadingSegmentId(null);
      setLoadingAction(null);
      return;
    }
    if (min !== undefined && initial < min) {
      setError(sub.id, `El km inicial no puede ser menor a ${min} km`);
      setLoadingSegmentId(null);
      setLoadingAction(null);
      return;
    }
    setError(sub.id, "");

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

      updateSingleSubTrip(sub.id, {
        status: "in_progress" as SubTripStatus,
        initial_mileage: initial,
        actual_start: now,
        start_latitude: location?.latitude ?? null,
        start_longitude: location?.longitude ?? null,
      });

      const sorted = [...subTrips, { ...sub, status: "in_progress" as SubTripStatus, initial_mileage: initial }].sort((a, b) => {
        const idA = typeof a.id === 'string' ? parseInt(a.id) : Number(a.id);
        const idB = typeof b.id === 'string' ? parseInt(b.id) : Number(b.id);
        return idA - idB;
      });

      const firstSubTrip = sorted[0];
      const isFirstSubTrip = firstSubTrip?.id === sub.id;

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
    } finally {
      setLoadingSegmentId(null);
      setLoadingAction(null);
    }
  };

  const handleEndSubTrip = async (sub: SubTrip) => {
    if (loadingSegmentId === sub.id && loadingAction === 'end') return;

    setLoadingSegmentId(sub.id);
    setLoadingAction('end');

    const finalStr = getKm(sub.id, "final");
    const final = parseFloat(finalStr);
    const initial = sub.initial_mileage ?? 0;

    if (isNaN(final)) {
      setError(sub.id, "Ingrese el kilometraje final");
      setLoadingSegmentId(null);
      setLoadingAction(null);
      return;
    }
    if (final <= initial) {
      setError(sub.id, `El km final debe ser mayor a ${initial} km`);
      setLoadingSegmentId(null);
      setLoadingAction(null);
      return;
    }
    setError(sub.id, "");

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

      // Actualizar el tramo actual
      updateSingleSubTrip(sub.id, {
        status: 'completed' as SubTripStatus,
        final_mileage: final,
        total_mileage: totalKm,
        total_hours: parseFloat(totalHours.toFixed(2)),
        actual_end: nowISO,
        end_latitude: location?.latitude ?? null,
        end_longitude: location?.longitude ?? null,
      });

      // Actualizar los siguientes tramos si es necesario
      const updatedSubTripsList = subTrips.map((s) => {
        const idA = typeof s.id === 'string' ? parseInt(s.id) : Number(s.id);
        const idB = typeof sub.id === 'string' ? parseInt(sub.id) : Number(sub.id);
        if (idA > idB && s.initial_mileage === null) {
          return {
            ...s,
            initial_mileage: final,
          };
        }
        return s;
      });

      const sorted = [...updatedSubTripsList].sort((a, b) => {
        const idA = typeof a.id === 'string' ? parseInt(a.id) : Number(a.id);
        const idB = typeof b.id === 'string' ? parseInt(b.id) : Number(b.id);
        return idA - idB;
      });

      const currentIndex = sorted.findIndex(s => s.id === sub.id);
      const nextSubTrip = sorted[currentIndex + 1];

      if (nextSubTrip && nextSubTrip.status === "locked") {
        updateSingleSubTrip(nextSubTrip.id, { status: "pending" as SubTripStatus });
      }

      const next = updatedSubTripsList.find((s) => {
        const idA = typeof s.id === 'string' ? parseInt(s.id) : Number(s.id);
        const idB = typeof sub.id === 'string' ? parseInt(sub.id) : Number(sub.id);
        return idA > idB && s.status === "pending";
      });

      if (next) {
        setExpandedIdCallback(next.id);
      }

      const allCompleted = result.all_completed || updatedSubTripsList.every((s) => s.status === "completed");

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
    } finally {
      setLoadingSegmentId(null);
      setLoadingAction(null);
    }
  };

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

  const getSegmentWarnings = useCallback(() => {
    const warnings: string[] = [];
    const segments = sortedSubTrips.map((sub, idx) => ({
      id: sub.id,
      name: sub.name,
      initial: parseFloat(editFormData.segments[sub.id]?.initial || ''),
      final: parseFloat(editFormData.segments[sub.id]?.final || ''),
      index: idx,
    }));

    for (const seg of segments) {
      if (!isNaN(seg.initial) && !isNaN(seg.final) && seg.final <= seg.initial) {
        warnings.push(`Tramo ${seg.index + 1}: km final debe ser mayor al inicial`);
      }
    }

    for (let i = 0; i < segments.length - 1; i++) {
      const current = segments[i];
      const next = segments[i + 1];
      if (!isNaN(current.final) && !isNaN(next.initial) && current.final > next.initial) {
        warnings.push(`Tramo ${i + 1} y ${i + 2}: el km final del tramo ${i + 1} (${current.final}) es mayor al km inicial del tramo ${i + 2} (${next.initial})`);
      }
    }

    return warnings;
  }, [sortedSubTrips, editFormData.segments]);

  const handleSaveMileageEdits = async () => {
    if (!localTrip) return;

    const generalInitial = parseFloat(editFormData.general_initial_km);
    const generalFinal = parseFloat(editFormData.general_final_km);

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

    if (firstSegment && !isNaN(generalInitial) && firstSegment.initial !== null) {
      if (firstSegment.initial < generalInitial) {
        errorToast(`El kilometraje inicial del primer tramo (${firstSegment.initial} km) no puede ser menor al kilometraje inicial general (${generalInitial} km)`);
        return;
      }
    }

    if (lastSegment && !isNaN(generalFinal) && lastSegment.final !== null) {
      if (lastSegment.final > generalFinal) {
        errorToast(`El kilometraje final del último tramo (${lastSegment.final} km) no puede ser mayor al kilometraje final general (${generalFinal} km)`);
        return;
      }
    }

    if (!isNaN(generalInitial) && !isNaN(generalFinal)) {
      if (generalFinal <= generalInitial) {
        errorToast("El kilometraje final general debe ser mayor al inicial");
        return;
      }
    }

    if (firstSegment && lastSegment &&
      firstSegment.initial !== null && lastSegment.final !== null) {
      if (firstSegment.initial > lastSegment.final) {
        errorToast(`El kilometraje inicial del primer tramo (${firstSegment.initial} km) no puede ser mayor al kilometraje final del último tramo (${lastSegment.final} km)`);
        return;
      }
    }

    for (let i = 0; i < segmentsList.length - 1; i++) {
      const current = segmentsList[i];
      const next = segmentsList[i + 1];

      if (current.final !== null && next.initial !== null) {
        if (current.final > next.initial) {
          errorToast(`Inconsistencia entre tramos: El km final del tramo "${current.name}" (${current.final} km) no puede ser mayor al km inicial del siguiente tramo "${next.name}" (${next.initial} km)`);
          return;
        }
      }
    }

    for (const segment of segmentsList) {
      if (segment.initial !== null && segment.final !== null) {
        if (segment.final <= segment.initial) {
          errorToast(`El kilometraje final del tramo "${segment.name}" (${segment.final} km) debe ser mayor al inicial (${segment.initial} km)`);
          return;
        }
      }
    }

    const segmentsDataToSend = [];
    for (const sub of sortedSubTrips) {
      const segmentData = editFormData.segments[sub.id];
      if (segmentData) {
        const initial = segmentData.initial ? parseFloat(segmentData.initial) : null;
        const final = segmentData.final ? parseFloat(segmentData.final) : null;

        segmentsDataToSend.push({
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
        segments: segmentsDataToSend,
      });

      setLocalTrip(updatedTravel);
      setIsEditingMileage(false);
      successToast("Kilometrajes actualizados correctamente");
    } catch (error: any) {
      errorToast(error.message || "Error al actualizar los kilometrajes");
    }
  };

  const handleExport = (format: 'excel' | 'pdf') => {
    if (localTrip) {
      exportReport({ travelId: localTrip.id, format });
    }
  };

  const handleSavingFuel = async () => {
    const isValid = await triggerValidation("factorKm");
    if (!isValid) {
      errorToast(formErrors.factorKm?.message || "Por favor, corrige el factor KM.");
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

      successToast("Combustible Registrado", `Monto total: S/ ${result.fuel?.fuelAmount?.toFixed(2) || "0.00"}`);
      setOpen(false);
    } catch (error: any) {
      console.error("Error al registrar combustible:", error);
      errorToast("Error al registrar combustible", error.message || "Error en el servidor");
    }
  };

  const sanitizeNumericInput = (value: string): string => {
    let sanitized = value.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = parts[0] + "." + parts.slice(1).join("");
    }
    return sanitized;
  };

  const handleInputChange = (field: keyof TravelControlModalData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = sanitizeNumericInput(e.target.value);
    setValue(field, sanitizedValue, { shouldValidate: true });
  };

  const isDriver = (userComplete?.position?.toUpperCase() === 'CONDUCTOR DE TRACTO CAMION') ||
    (userComplete?.position?.toUpperCase() === 'INSTRUCTOR DE FLOTA');
  const isComercial = (userComplete?.role?.toUpperCase() === 'COMERCIAL Y FACTURACION TP') ||
    (userComplete?.position?.toUpperCase() === 'ASISTENTE DE OPERACIONES');
  const userCanEditMileage = canUpdate && !isDriver;

  const isSegmentLoading = useCallback((segmentId: string, action: 'start' | 'end') => {
    return loadingSegmentId === segmentId && loadingAction === action;
  }, [loadingSegmentId, loadingAction]);



  if (!localTrip) {
    return <>{trigger}</>;
  }

  return (
    <TooltipProvider>
      <>
        <span onClick={() => setOpen(true)} className="cursor-pointer inline-block">
          {trigger}
        </span>

        <GeneralSheet
          open={open}
          onClose={() => setOpen(false)}
          title="Detalles del Viaje"
          subtitle={`${localTrip.tripNumber} • ${localTrip.route}`}
          className="w-[95vw] max-w-[900px] overflow-auto"
          side="right"
          icon="Truck"
          size="xl"
        >
          <Form {...form}>
            <div className="mt-4 space-y-6 overflow-auto max-h-[75vh] pr-4">
              {/* Header con botones de acción */}
              <div className="flex items-center justify-between sticky top-0 bg-background z-10 border-b pb-4">
                <div className="flex items-center gap-4">
                  {(localTrip.status === "fuel_pending" || localTrip.status === "completed") && canExport && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="default" className="gap-2 h-11 px-4" disabled={isExporting}>
                          {isExporting ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Download className="h-5 w-5" />
                          )}
                          Exportar
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleExport('excel')} className="text-base py-2">
                          Exportar a Excel
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExport('pdf')} className="text-base py-2">
                          Exportar a PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              {/* Versión para Conductores */}
              {isDriver ? (
                <>
                  {/* Stopwatch */}
                  {localTrip.status === "in_progress" && localTrip.startTime && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 shadow-md border border-green-200">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <Clock className="h-7 w-7 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-800">Viaje en progreso</p>
                          <p className="text-xs text-green-600">
                            Inicio: {getStartTime()?.toLocaleString("es-PE") || "N/A"} • {localTrip.initialKm} km
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
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-xl">
                              <Navigation className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="font-bold text-xl text-foreground">Tramos del Viaje</h2>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-white rounded-full px-4 py-2 shadow-sm">
                              <span className="text-sm font-semibold text-primary">
                                {completedCount} / {sortedSubTrips.length}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">completados</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500 rounded-full"
                            style={{ width: `${(completedCount / sortedSubTrips.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100">
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
                                "transition-all duration-200",
                                isLocked && "bg-gray-50 opacity-70",
                                isPending && "bg-gradient-to-r from-primary/5 to-transparent",
                                isActive && "bg-gradient-to-r from-green-50 to-transparent",
                                isCompleted && "bg-gradient-to-r from-emerald-50 to-transparent"
                              )}
                            >
                              <button
                                onClick={() => !isLocked && setExpandedIdCallback(isExpanded ? null : sub.id)}
                                disabled={isLocked}
                                className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50/50 transition-colors"
                              >
                                <div
                                  className={cn(
                                    "h-12 w-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all",
                                    isLocked && "bg-gray-200 text-gray-500",
                                    isPending && "bg-primary/20 text-primary border-2 border-primary/30",
                                    isActive && "bg-green-500 text-white shadow-md animate-pulse",
                                    isCompleted && "bg-emerald-500 text-white shadow-md"
                                  )}
                                >
                                  {isLocked && <Lock className="h-5 w-5" />}
                                  {isPending && <span className="text-base font-bold">{tramoNumber}</span>}
                                  {isActive && <Play className="h-5 w-5" />}
                                  {isCompleted && <CheckCircle className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-base font-bold text-foreground flex items-center gap-2">
                                    {sub.name}
                                    {isActive && (
                                      <Badge className="bg-green-500 text-white text-xs animate-pulse">
                                        En curso
                                      </Badge>
                                    )}
                                  </p>
                                </div>
                                {!isLocked && (
                                  isExpanded ? (
                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                  )
                                )}
                              </button>

                              {!isLocked && isExpanded && (
                                <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                                  {error && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                      <AlertCircle className="h-5 w-5 shrink-0" />
                                      <span>{error}</span>
                                    </div>
                                  )}

                                  {isPending && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-base font-semibold flex items-center gap-2 mb-2">
                                          <Gauge className="h-4 w-4 text-primary" />
                                          Kilometraje Inicial
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                              <p>Ingresa el kilometraje actual de tu vehículo antes de iniciar este tramo.</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </Label>
                                        <div className="relative">
                                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Gauge className="h-5 w-5 text-primary" />
                                          </div>
                                          <Input
                                            id={`init-${sub.id}`}
                                            type="number"
                                            step="1"
                                            placeholder={minKm ? `Mínimo: ${minKm} km` : "Ej: 12500"}
                                            value={getKm(sub.id, "initial") || (sub.initial_mileage ? Number(sub.initial_mileage).toString() : "")}
                                            onChange={(e) => setKm(sub.id, "initial", e.target.value)}
                                            disabled={isSegmentLoading(sub.id, 'start')}
                                            className={cn(
                                              "pl-12 h-14 text-base rounded-xl border-2 focus:border-primary transition-all",
                                              (!isFirstTrip && hasPreloadedMileage) && "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                                            )}
                                          />
                                        </div>
                                        {minKm !== undefined && (
                                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-blue-50 p-2 rounded-lg">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                            <span>Último registro del vehículo: <strong>{minKm} km</strong></span>
                                          </div>
                                        )}
                                      </div>
                                      <Button
                                        onClick={() => handleStartSubTrip(sub)}
                                        disabled={(!getKm(sub.id, "initial") && !sub.initial_mileage) || isSegmentLoading(sub.id, 'start')}
                                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-6 text-base rounded-xl shadow-md transition-all disabled:opacity-70"
                                        size="lg"
                                      >
                                        {isSegmentLoading(sub.id, 'start') ? (
                                          <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Iniciando...
                                          </>
                                        ) : (
                                          <>
                                            <Play className="h-5 w-5 mr-2" />
                                            Iniciar Tramo
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )}

                                  {isActive && (
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                                        <div className="p-2 bg-green-100 rounded-full">
                                          <Clock className="h-5 w-5 text-green-700" />
                                        </div>
                                        <div>
                                          <p className="text-xs text-green-600 font-medium">TRAMO INICIADO</p>
                                          <p className="text-sm font-semibold text-green-800">
                                            {startTimeFormatted} • {displayInitialKm} km
                                          </p>
                                        </div>
                                      </div>
                                      <>
                                        <div>
                                          <Label className="text-base font-semibold flex items-center gap-2 mb-2">
                                            <Gauge className="h-4 w-4 text-primary" />
                                            Kilometraje Final
                                            <Tooltip>
                                              <TooltipTrigger asChild>
                                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                              </TooltipTrigger>
                                              <TooltipContent>
                                                <p>Ingresa el kilometraje actual al llegar a tu destino.</p>
                                              </TooltipContent>
                                            </Tooltip>
                                          </Label>
                                          <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                              <Gauge className="h-5 w-5 text-primary" />
                                            </div>
                                            <Input
                                              id={`end-${sub.id}`}
                                              type="number"
                                              step="1"
                                              placeholder={`Debe ser mayor a: ${sub.initial_mileage} km`}
                                              value={getKm(sub.id, "final")}
                                              onChange={(e) => setKm(sub.id, "final", e.target.value)}
                                              disabled={isSegmentLoading(sub.id, 'end')}
                                              className="pl-12 h-14 text-base rounded-xl border-2 focus:border-primary transition-all"
                                            />
                                          </div>
                                        </div>
                                        <Button
                                          onClick={() => handleEndSubTrip(sub)}
                                          disabled={!getKm(sub.id, "final") || isSegmentLoading(sub.id, 'end')}
                                          className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-6 text-base rounded-xl shadow-md transition-all disabled:opacity-70"
                                          size="lg"
                                        >
                                          {isSegmentLoading(sub.id, 'end') ? (
                                            <>
                                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                              Finalizando...
                                            </>
                                          ) : (
                                            <>
                                              <Square className="h-5 w-5 mr-2" />
                                              Finalizar Tramo
                                            </>
                                          )}
                                        </Button>
                                      </>
                                    </div>
                                  )}

                                  {isCompleted && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className="p-3 bg-gray-100 rounded-xl text-center">
                                        <p className="text-xs text-muted-foreground">Km Inicial</p>
                                        <p className="font-bold text-base">{displayInitialKm ?? "-"}</p>
                                      </div>
                                      <div className="p-3 bg-gray-100 rounded-xl text-center">
                                        <p className="text-xs text-muted-foreground">Km Final</p>
                                        <p className="font-bold text-base">{displayFinalKm ?? "-"}</p>
                                      </div>
                                      <div className="p-3 bg-emerald-100 rounded-xl text-center">
                                        <p className="text-xs text-emerald-600">Total Km</p>
                                        <p className="font-bold text-base text-emerald-700">{displayTotalKm ?? "-"}</p>
                                      </div>
                                      <div className="p-3 bg-emerald-100 rounded-xl text-center">
                                        <p className="text-xs text-emerald-600">Total Horas</p>
                                        <p className="font-bold text-base text-emerald-700">
                                          {displayTotalHours !== null && displayTotalHours !== undefined
                                            ? Number(displayTotalHours).toFixed(2)
                                            : "-"}
                                        </p>
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

                  {/* Finalizar Viaje General */}
                  {localTrip.status === "in_progress" && allSubTripsCompleted && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 shadow-md border border-amber-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-full">
                          <Square className="h-6 w-6 text-amber-700" />
                        </div>
                        <h2 className="font-bold text-xl text-amber-800">Finalizar Viaje General</h2>
                      </div>
                      <div className="space-y-4">
                        <FormInput
                          control={control}
                          name="tonnage"
                          label="Toneladas Transportadas (opcional)"
                          type="text"
                          inputMode="decimal"
                          placeholder="Ej: 25.5"
                          addonStart={<Package className="h-5 w-5 text-gray-500" />}
                          className="pl-12 h-14 text-base rounded-xl"
                          disabled={formSubmitting || isEndingRoute}
                          error={formErrors.tonnage?.message}
                          onChange={handleInputChange("tonnage")}
                        />
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" />
                          Opcional - Ingresa el peso total transportado
                        </p>
                        <Button
                          onClick={() => {
                            const lastSub = sortedSubTrips[sortedSubTrips.length - 1];
                            if (lastSub?.status === "completed") {
                              handleEndSubTrip(lastSub);
                            }
                          }}
                          disabled={isSegmentLoading(sortedSubTrips[sortedSubTrips.length - 1]?.id, 'end')}
                          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-6 text-base rounded-xl shadow-md disabled:opacity-70"
                          size="lg"
                        >
                          {isSegmentLoading(sortedSubTrips[sortedSubTrips.length - 1]?.id, 'end') ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Finalizando...
                            </>
                          ) : (
                            <>
                              <Square className="h-5 w-5 mr-2" />
                              Finalizar Viaje General
                            </>
                          )}
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
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-1 bg-primary rounded-full"></div>
                          <h3 className="font-bold text-xl text-foreground">Métricas del Viaje</h3>
                        </div>
                        {userCanEditMileage && (
                          !isEditingMileage ? (
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => setIsEditingMileage(true)}
                              className="gap-2 h-11"
                              disabled={isUpdatingMileage}
                            >
                              <Pencil className="h-4 w-4" />
                              Editar Kilometrajes
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="default"
                                onClick={() => setIsEditingMileage(false)}
                                disabled={isUpdatingMileage}
                                className="h-11"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                              <Button
                                variant="default"
                                size="default"
                                onClick={handleSaveMileageEdits}
                                disabled={isUpdatingMileage}
                                className="gap-2 h-11"
                              >
                                {isUpdatingMileage ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                Guardar
                              </Button>
                            </div>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {!isEditingMileage || !userCanEditMileage ? (
                          <>
                            <div className="p-4 bg-muted/30 rounded-xl text-center">
                              <p className="text-sm text-muted-foreground">Km Inicial</p>
                              <p className="font-bold text-2xl text-foreground">{localTrip.initialKm?.toString() || "-"}</p>
                              <p className="text-xs text-muted-foreground">km</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl text-center">
                              <p className="text-sm text-muted-foreground">Km Final</p>
                              <p className="font-bold text-2xl text-foreground">{localTrip.finalKm?.toString() || "-"}</p>
                              <p className="text-xs text-muted-foreground">km</p>
                            </div>
                            <div className="p-4 bg-primary/10 rounded-xl text-center">
                              <p className="text-sm text-primary">Total Km</p>
                              <p className="font-bold text-2xl text-primary">{localTrip.totalKm?.toString() || "-"}</p>
                              <p className="text-xs text-primary/70">km</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl text-center">
                              <p className="text-sm text-muted-foreground">Horas Totales</p>
                              <p className="font-bold text-2xl text-foreground">{localTrip.totalHours?.toFixed(2) || "-"}</p>
                              <p className="text-xs text-muted-foreground">horas</p>
                            </div>
                            {localTrip.tonnage && (
                              <div className="p-4 bg-muted/30 rounded-xl text-center">
                                <p className="text-sm text-muted-foreground">Toneladas</p>
                                <p className="font-bold text-2xl text-foreground">{localTrip.tonnage}</p>
                                <p className="text-xs text-muted-foreground">ton</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div>
                              <Label className="text-sm font-semibold">Km Inicial General</Label>
                              <div className="relative mt-2">
                                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="1"
                                  value={editFormData.general_initial_km}
                                  onChange={(e) => handleEditFieldChange('general_initial_km', e.target.value)}
                                  className="pl-12 h-12 text-base rounded-xl"
                                  placeholder="Km inicial"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-semibold">Km Final General</Label>
                              <div className="relative mt-2">
                                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="1"
                                  value={editFormData.general_final_km}
                                  onChange={(e) => handleEditFieldChange('general_final_km', e.target.value)}
                                  className="pl-12 h-12 text-base rounded-xl"
                                  placeholder="Km final"
                                />
                              </div>
                            </div>
                            <div className="p-4 bg-primary/10 rounded-xl text-center">
                              <p className="text-sm text-primary font-medium">Total Km</p>
                              <p className="font-bold text-2xl text-primary">
                                {(() => {
                                  const initial = parseFloat(editFormData.general_initial_km);
                                  const final = parseFloat(editFormData.general_final_km);
                                  if (!isNaN(initial) && !isNaN(final) && final > initial) {
                                    return `${(final - initial).toFixed(0)} km`;
                                  }
                                  return localTrip.totalKm ? `${localTrip.totalKm} km` : "-";
                                })()}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {isEditingMileage && userCanEditMileage && (() => {
                        const warnings = getSegmentWarnings();
                        if (warnings.length > 0) {
                          return (
                            <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 space-y-2">
                              {warnings.map((w, i) => (
                                <p key={i} className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 shrink-0" />
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b pb-2">
                        <div className="h-8 w-1 bg-primary rounded-full"></div>
                        <h2 className="font-bold text-xl text-foreground">Métricas por Tramo</h2>
                        {isEditingMileage && userCanEditMileage && (
                          <Badge variant="outline" className="ml-2 text-sm py-1 px-3">
                            <Edit3 className="h-3 w-3 mr-1" />
                            Modo edición
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-4">
                        {sortedSubTrips.map((sub, index) => {
                          const tramoNumber = index + 1;
                          const isCompleted = sub.status === "completed";
                          const segmentData = editFormData.segments[sub.id];

                          let autoTotalKm = null;
                          if (isEditingMileage && segmentData) {
                            const initial = parseFloat(segmentData.initial);
                            const final = parseFloat(segmentData.final);
                            if (!isNaN(initial) && !isNaN(final) && final > initial) {
                              autoTotalKm = final - initial;
                            }
                          }

                          return (
                            <div key={sub.id} className="border-2 border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-base font-bold text-foreground">
                                    Tramo {tramoNumber}: {sub.origin} - {sub.destination}
                                  </p>
                                </div>
                                <span className={cn(
                                  "text-sm px-3 py-1 rounded-full font-medium",
                                  isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                                )}>
                                  {isCompleted ? " Completado" : "○ Pendiente"}
                                </span>
                              </div>

                              {!isEditingMileage ? (
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Km Inicial</p>
                                    <p className="font-bold text-lg">{sub.initial_mileage ?? '-'}</p>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Km Final</p>
                                    <p className="font-bold text-lg">{sub.final_mileage ?? '-'}</p>
                                  </div>
                                  <div className="p-3 bg-emerald-50 rounded-lg text-center">
                                    <p className="text-xs text-emerald-600">Total Km</p>
                                    <p className="font-bold text-lg text-emerald-700">{sub.total_mileage ?? '-'}</p>
                                  </div>
                                </div>
                              ) : userCanEditMileage ? (
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <Label className="text-xs">Km Inicial</Label>
                                    <Input
                                      type="number"
                                      step="1"
                                      value={segmentData?.initial || ""}
                                      onChange={(e) => handleEditSegmentChange(sub.id, 'initial', e.target.value)}
                                      className="mt-1 h-11 text-base rounded-lg"
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
                                      className="mt-1 h-11 text-base rounded-lg"
                                      placeholder="Km final"
                                    />
                                  </div>
                                  <div className="bg-primary/5 rounded-lg p-2 text-center">
                                    <p className="text-xs text-muted-foreground">Total Km</p>
                                    <p className={cn(
                                      "font-bold text-base",
                                      autoTotalKm !== null ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                      {autoTotalKm !== null ? `${autoTotalKm.toFixed(0)} km` : (sub.total_mileage ?? '-')}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-3 gap-3 opacity-75">
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Km Inicial</p>
                                    <p className="font-bold text-lg">{sub.initial_mileage ?? '-'}</p>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Km Final</p>
                                    <p className="font-bold text-lg">{sub.final_mileage ?? '-'}</p>
                                  </div>
                                  <div className="p-3 bg-emerald-50 rounded-lg text-center">
                                    <p className="text-xs text-emerald-600">Total Km</p>
                                    <p className="font-bold text-lg text-emerald-700">{sub.total_mileage ?? '-'}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                // Versión para usuarios no conductores (comerciales, etc.)
                <>
                  {/* Información del Viaje */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 border-b pb-2">
                      <div className="h-8 w-1 bg-primary rounded-full"></div>
                      <h3 className="font-bold text-xl text-foreground">Información del Viaje</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <Truck className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Placa</p>
                          <p className="font-bold text-lg">{localTrip.plate || "Sin placa"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Conductor</p>
                          <p className="font-bold text-lg">{localTrip.driver?.name || "Sin Conductor"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Ruta</p>
                          <p className="font-bold text-lg">{localTrip.route || "Sin Ruta"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl shadow-sm">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                          <Package className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground uppercase tracking-wide">Cliente</p>
                          <p className="font-bold text-lg">{localTrip.client || "Sin cliente"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Stopwatch */}
                  {localTrip.status === "in_progress" && localTrip.startTime && (
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-5 shadow-md border border-green-200">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <Clock className="h-7 w-7 text-green-700" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-green-800">Viaje en progreso</p>
                          <p className="text-xs text-green-600">
                            Inicio: {getStartTime()?.toLocaleString("es-PE") || "N/A"} • {localTrip.initialKm} km
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
                    <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-4 border-b">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/20 rounded-xl">
                              <Navigation className="h-5 w-5 text-primary" />
                            </div>
                            <h2 className="font-bold text-xl text-foreground">Tramos del Viaje</h2>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="bg-white rounded-full px-4 py-2 shadow-sm">
                              <span className="text-sm font-semibold text-primary">
                                {completedCount} / {sortedSubTrips.length}
                              </span>
                              <span className="text-xs text-muted-foreground ml-1">completados</span>
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-500 rounded-full"
                            style={{ width: `${(completedCount / sortedSubTrips.length) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div className="divide-y divide-gray-100">
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
                                "transition-all duration-200",
                                isLocked && "bg-gray-50 opacity-70",
                                isPending && "bg-gradient-to-r from-primary/5 to-transparent",
                                isActive && "bg-gradient-to-r from-green-50 to-transparent",
                                isCompleted && "bg-gradient-to-r from-emerald-50 to-transparent"
                              )}
                            >
                              <button
                                onClick={() => !isLocked && setExpandedIdCallback(isExpanded ? null : sub.id)}
                                disabled={isLocked}
                                className="w-full p-5 flex items-center gap-4 text-left hover:bg-gray-50/50 transition-colors"
                              >
                                <div
                                  className={cn(
                                    "h-12 w-12 rounded-full flex items-center justify-center shrink-0 shadow-sm transition-all",
                                    isLocked && "bg-gray-200 text-gray-500",
                                    isPending && "bg-primary/20 text-primary border-2 border-primary/30",
                                    isActive && "bg-green-500 text-white shadow-md animate-pulse",
                                    isCompleted && "bg-emerald-500 text-white shadow-md"
                                  )}
                                >
                                  {isLocked && <Lock className="h-5 w-5" />}
                                  {isPending && <span className="text-base font-bold">{tramoNumber}</span>}
                                  {isActive && <Play className="h-5 w-5" />}
                                  {isCompleted && <CheckCircle className="h-5 w-5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-base font-bold text-foreground flex items-center gap-2">
                                    {sub.name}
                                    {isActive && (
                                      <Badge className="bg-green-500 text-white text-xs animate-pulse">
                                        En curso
                                      </Badge>
                                    )}
                                  </p>
                                </div>
                                {!isLocked && (
                                  isExpanded ? (
                                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                  )
                                )}
                              </button>

                              {!isLocked && isExpanded && (
                                <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                                  {error && (
                                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                                      <AlertCircle className="h-5 w-5 shrink-0" />
                                      <span>{error}</span>
                                    </div>
                                  )}

                                  {isPending && isDriver && (
                                    <div className="space-y-4">
                                      <div>
                                        <Label className="text-base font-semibold flex items-center gap-2 mb-2">
                                          <Gauge className="h-4 w-4 text-primary" />
                                          Kilometraje Inicial
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                            </TooltipTrigger>
                                            <TooltipContent className="max-w-xs">
                                              <p>Ingresa el kilometraje actual de tu vehículo antes de iniciar este tramo.</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        </Label>
                                        <div className="relative">
                                          <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                            <Gauge className="h-5 w-5 text-primary" />
                                          </div>
                                          <Input
                                            id={`init-${sub.id}`}
                                            type="number"
                                            step="1"
                                            placeholder={minKm ? `Mínimo: ${minKm} km` : "Ej: 12500"}
                                            value={getKm(sub.id, "initial") || (sub.initial_mileage ? Number(sub.initial_mileage).toString() : "")}
                                            onChange={(e) => setKm(sub.id, "initial", e.target.value)}
                                            disabled={isSegmentLoading(sub.id, 'start')}
                                            className={cn(
                                              "pl-12 h-14 text-base rounded-xl border-2 focus:border-primary transition-all",
                                              (!isFirstTrip && hasPreloadedMileage) && "bg-gray-100 text-gray-500 cursor-not-allowed border-gray-200"
                                            )}
                                          />
                                        </div>
                                        {minKm !== undefined && (
                                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground bg-blue-50 p-2 rounded-lg">
                                            <Clock className="h-4 w-4 text-blue-500" />
                                            <span>Último registro del vehículo: <strong>{minKm} km</strong></span>
                                          </div>
                                        )}
                                      </div>
                                      <Button
                                        onClick={() => handleStartSubTrip(sub)}
                                        disabled={(!getKm(sub.id, "initial") && !sub.initial_mileage) || isSegmentLoading(sub.id, 'start')}
                                        className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-6 text-base rounded-xl shadow-md transition-all disabled:opacity-70"
                                        size="lg"
                                      >
                                        {isSegmentLoading(sub.id, 'start') ? (
                                          <>
                                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                            Iniciando...
                                          </>
                                        ) : (
                                          <>
                                            <Play className="h-5 w-5 mr-2" />
                                            Iniciar Tramo
                                          </>
                                        )}
                                      </Button>
                                    </div>
                                  )}

                                  {isActive && (
                                    <div className="space-y-4">
                                      <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                                        <div className="p-2 bg-green-100 rounded-full">
                                          <Clock className="h-5 w-5 text-green-700" />
                                        </div>
                                        <div>
                                          <p className="text-xs text-green-600 font-medium">TRAMO INICIADO</p>
                                          <p className="text-sm font-semibold text-green-800">
                                            {startTimeFormatted} • {displayInitialKm} km
                                          </p>
                                        </div>
                                      </div>
                                      {isDriver && (
                                        <>
                                          <div>
                                            <Label className="text-base font-semibold flex items-center gap-2 mb-2">
                                              <Gauge className="h-4 w-4 text-primary" />
                                              Kilometraje Final
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>Ingresa el kilometraje actual al llegar a tu destino.</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </Label>
                                            <div className="relative">
                                              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                                <Gauge className="h-5 w-5 text-primary" />
                                              </div>
                                              <Input
                                                id={`end-${sub.id}`}
                                                type="number"
                                                step="1"
                                                placeholder={`Debe ser mayor a: ${sub.initial_mileage} km`}
                                                value={getKm(sub.id, "final")}
                                                onChange={(e) => setKm(sub.id, "final", e.target.value)}
                                                disabled={isSegmentLoading(sub.id, 'end')}
                                                className="pl-12 h-14 text-base rounded-xl border-2 focus:border-primary transition-all"
                                              />
                                            </div>
                                          </div>
                                          <Button
                                            onClick={() => handleEndSubTrip(sub)}
                                            disabled={!getKm(sub.id, "final") || isSegmentLoading(sub.id, 'end')}
                                            className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold py-6 text-base rounded-xl shadow-md transition-all disabled:opacity-70"
                                            size="lg"
                                          >
                                            {isSegmentLoading(sub.id, 'end') ? (
                                              <>
                                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                                Finalizando...
                                              </>
                                            ) : (
                                              <>
                                                <Square className="h-5 w-5 mr-2" />
                                                Finalizar Tramo
                                              </>
                                            )}
                                          </Button>
                                        </>
                                      )}
                                    </div>
                                  )}

                                  {isCompleted && (
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className="p-3 bg-gray-100 rounded-xl text-center">
                                        <p className="text-xs text-muted-foreground">Km Inicial</p>
                                        <p className="font-bold text-base">{displayInitialKm ?? "-"}</p>
                                      </div>
                                      <div className="p-3 bg-gray-100 rounded-xl text-center">
                                        <p className="text-xs text-muted-foreground">Km Final</p>
                                        <p className="font-bold text-base">{displayFinalKm ?? "-"}</p>
                                      </div>
                                      <div className="p-3 bg-emerald-100 rounded-xl text-center">
                                        <p className="text-xs text-emerald-600">Total Km</p>
                                        <p className="font-bold text-base text-emerald-700">{displayTotalKm ?? "-"}</p>
                                      </div>
                                      <div className="p-3 bg-emerald-100 rounded-xl text-center">
                                        <p className="text-xs text-emerald-600">Total Horas</p>
                                        <p className="font-bold text-base text-emerald-700">
                                          {displayTotalHours !== null && displayTotalHours !== undefined
                                            ? Number(displayTotalHours).toFixed(2)
                                            : "-"}
                                        </p>
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

                  {/* Finalizar Viaje General */}
                  {localTrip.status === "in_progress" && allSubTripsCompleted && isDriver && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 shadow-md border border-amber-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-amber-100 rounded-full">
                          <Square className="h-6 w-6 text-amber-700" />
                        </div>
                        <h2 className="font-bold text-xl text-amber-800">Finalizar Viaje General</h2>
                      </div>
                      <div className="space-y-4">
                        <FormInput
                          control={control}
                          name="tonnage"
                          label="Toneladas Transportadas (opcional)"
                          type="text"
                          inputMode="decimal"
                          placeholder="Ej: 25.5"
                          addonStart={<Package className="h-5 w-5 text-gray-500" />}
                          className="pl-12 h-14 text-base rounded-xl"
                          disabled={formSubmitting || isEndingRoute}
                          error={formErrors.tonnage?.message}
                          onChange={handleInputChange("tonnage")}
                        />
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <HelpCircle className="h-3 w-3" />
                          Opcional - Ingresa el peso total transportado
                        </p>
                        <Button
                          onClick={() => {
                            const lastSub = sortedSubTrips[sortedSubTrips.length - 1];
                            if (lastSub?.status === "completed") {
                              handleEndSubTrip(lastSub);
                            }
                          }}
                          disabled={isSegmentLoading(sortedSubTrips[sortedSubTrips.length - 1]?.id, 'end')}
                          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-semibold py-6 text-base rounded-xl shadow-md disabled:opacity-70"
                          size="lg"
                        >
                          {isSegmentLoading(sortedSubTrips[sortedSubTrips.length - 1]?.id, 'end') ? (
                            <>
                              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                              Finalizando...
                            </>
                          ) : (
                            <>
                              <Square className="h-5 w-5 mr-2" />
                              Finalizar Viaje General
                            </>
                          )}
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
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-1 bg-primary rounded-full"></div>
                          <h3 className="font-bold text-xl text-foreground">Métricas del Viaje</h3>
                        </div>
                        {userCanEditMileage && (
                          !isEditingMileage ? (
                            <Button
                              variant="outline"
                              size="default"
                              onClick={() => setIsEditingMileage(true)}
                              className="gap-2 h-11"
                              disabled={isUpdatingMileage}
                            >
                              <Pencil className="h-4 w-4" />
                              Editar Kilometrajes
                            </Button>
                          ) : (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="default"
                                onClick={() => setIsEditingMileage(false)}
                                disabled={isUpdatingMileage}
                                className="h-11"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                              <Button
                                variant="default"
                                size="default"
                                onClick={handleSaveMileageEdits}
                                disabled={isUpdatingMileage}
                                className="gap-2 h-11"
                              >
                                {isUpdatingMileage ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                                Guardar
                              </Button>
                            </div>
                          )
                        )}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {!isEditingMileage || !userCanEditMileage ? (
                          <>
                            <div className="p-4 bg-muted/30 rounded-xl text-center">
                              <p className="text-sm text-muted-foreground">Km Inicial</p>
                              <p className="font-bold text-2xl text-foreground">{localTrip.initialKm?.toString() || "-"}</p>
                              <p className="text-xs text-muted-foreground">km</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl text-center">
                              <p className="text-sm text-muted-foreground">Km Final</p>
                              <p className="font-bold text-2xl text-foreground">{localTrip.finalKm?.toString() || "-"}</p>
                              <p className="text-xs text-muted-foreground">km</p>
                            </div>
                            <div className="p-4 bg-primary/10 rounded-xl text-center">
                              <p className="text-sm text-primary">Total Km</p>
                              <p className="font-bold text-2xl text-primary">{localTrip.totalKm?.toString() || "-"}</p>
                              <p className="text-xs text-primary/70">km</p>
                            </div>
                            <div className="p-4 bg-muted/30 rounded-xl text-center">
                              <p className="text-sm text-muted-foreground">Horas Totales</p>
                              <p className="font-bold text-2xl text-foreground">{localTrip.totalHours?.toFixed(2) || "-"}</p>
                              <p className="text-xs text-muted-foreground">horas</p>
                            </div>
                            {localTrip.tonnage && (
                              <div className="p-4 bg-muted/30 rounded-xl text-center">
                                <p className="text-sm text-muted-foreground">Toneladas</p>
                                <p className="font-bold text-2xl text-foreground">{localTrip.tonnage}</p>
                                <p className="text-xs text-muted-foreground">ton</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div>
                              <Label className="text-sm font-semibold">Km Inicial General</Label>
                              <div className="relative mt-2">
                                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="1"
                                  value={editFormData.general_initial_km}
                                  onChange={(e) => handleEditFieldChange('general_initial_km', e.target.value)}
                                  className="pl-12 h-12 text-base rounded-xl"
                                  placeholder="Km inicial"
                                />
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm font-semibold">Km Final General</Label>
                              <div className="relative mt-2">
                                <Gauge className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                <Input
                                  type="number"
                                  step="1"
                                  value={editFormData.general_final_km}
                                  onChange={(e) => handleEditFieldChange('general_final_km', e.target.value)}
                                  className="pl-12 h-12 text-base rounded-xl"
                                  placeholder="Km final"
                                />
                              </div>
                            </div>
                            <div className="p-4 bg-primary/10 rounded-xl text-center">
                              <p className="text-sm text-primary font-medium">Total Km</p>
                              <p className="font-bold text-2xl text-primary">
                                {(() => {
                                  const initial = parseFloat(editFormData.general_initial_km);
                                  const final = parseFloat(editFormData.general_final_km);
                                  if (!isNaN(initial) && !isNaN(final) && final > initial) {
                                    return `${(final - initial).toFixed(0)} km`;
                                  }
                                  return localTrip.totalKm ? `${localTrip.totalKm} km` : "-";
                                })()}
                              </p>
                            </div>
                          </>
                        )}
                      </div>

                      {isEditingMileage && userCanEditMileage && (() => {
                        const warnings = getSegmentWarnings();
                        if (warnings.length > 0) {
                          return (
                            <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700 space-y-2">
                              {warnings.map((w, i) => (
                                <p key={i} className="flex items-center gap-2">
                                  <AlertCircle className="h-4 w-4 shrink-0" />
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
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 border-b pb-2">
                        <div className="h-8 w-1 bg-primary rounded-full"></div>
                        <h2 className="font-bold text-xl text-foreground">Métricas por Tramo</h2>
                        {isEditingMileage && userCanEditMileage && (
                          <Badge variant="outline" className="ml-2 text-sm py-1 px-3">
                            <Edit3 className="h-3 w-3 mr-1" />
                            Modo edición
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-4">
                        {sortedSubTrips.map((sub, index) => {
                          const tramoNumber = index + 1;
                          const isCompleted = sub.status === "completed";
                          const segmentData = editFormData.segments[sub.id];

                          let autoTotalKm = null;
                          if (isEditingMileage && segmentData) {
                            const initial = parseFloat(segmentData.initial);
                            const final = parseFloat(segmentData.final);
                            if (!isNaN(initial) && !isNaN(final) && final > initial) {
                              autoTotalKm = final - initial;
                            }
                          }

                          return (
                            <div key={sub.id} className="border-2 border-gray-100 rounded-xl p-4 bg-white shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-base font-bold text-foreground">
                                    Tramo {tramoNumber}: {sub.origin} - {sub.destination}
                                  </p>
                                </div>
                                <span className={cn(
                                  "text-sm px-3 py-1 rounded-full font-medium",
                                  isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                                )}>
                                  {isCompleted ? "✓ Completado" : "○ Pendiente"}
                                </span>
                              </div>

                              {!isEditingMileage ? (
                                <div className="grid grid-cols-3 gap-3">
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Km Inicial</p>
                                    <p className="font-bold text-lg">{sub.initial_mileage ?? '-'}</p>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Km Final</p>
                                    <p className="font-bold text-lg">{sub.final_mileage ?? '-'}</p>
                                  </div>
                                  <div className="p-3 bg-emerald-50 rounded-lg text-center">
                                    <p className="text-xs text-emerald-600">Total Km</p>
                                    <p className="font-bold text-lg text-emerald-700">{sub.total_mileage ?? '-'}</p>
                                  </div>
                                </div>
                              ) : userCanEditMileage ? (
                                <div className="grid grid-cols-3 gap-3">
                                  <div>
                                    <Label className="text-xs">Km Inicial</Label>
                                    <Input
                                      type="number"
                                      step="1"
                                      value={segmentData?.initial || ""}
                                      onChange={(e) => handleEditSegmentChange(sub.id, 'initial', e.target.value)}
                                      className="mt-1 h-11 text-base rounded-lg"
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
                                      className="mt-1 h-11 text-base rounded-lg"
                                      placeholder="Km final"
                                    />
                                  </div>
                                  <div className="bg-primary/5 rounded-lg p-2 text-center">
                                    <p className="text-xs text-muted-foreground">Total Km</p>
                                    <p className={cn(
                                      "font-bold text-base",
                                      autoTotalKm !== null ? "text-green-600" : "text-muted-foreground"
                                    )}>
                                      {autoTotalKm !== null ? `${autoTotalKm.toFixed(0)} km` : (sub.total_mileage ?? '-')}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="grid grid-cols-3 gap-3 opacity-75">
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Km Inicial</p>
                                    <p className="font-bold text-lg">{sub.initial_mileage ?? '-'}</p>
                                  </div>
                                  <div className="p-3 bg-gray-50 rounded-lg text-center">
                                    <p className="text-xs text-muted-foreground">Km Final</p>
                                    <p className="font-bold text-lg">{sub.final_mileage ?? '-'}</p>
                                  </div>
                                  <div className="p-3 bg-emerald-50 rounded-lg text-center">
                                    <p className="text-xs text-emerald-600">Total Km</p>
                                    <p className="font-bold text-lg text-emerald-700">{sub.total_mileage ?? '-'}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Registro de Combustible - Solo para comerciales */}
              {localTrip.status === "fuel_pending" && isComercial && (
                <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-6 shadow-md border border-orange-200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-orange-100 rounded-full">
                      <Fuel className="h-6 w-6 text-orange-700" />
                    </div>
                    <h3 className="font-bold text-xl text-orange-800">Registro de Combustible</h3>
                  </div>

                  <div className="space-y-5">
                    <FormInput
                      control={control}
                      name="factorKm"
                      label="Factor Kilómetro (S/. por km)"
                      type="text"
                      inputMode="decimal"
                      placeholder="Ej: 1.80"
                      addonStart={<span className="text-gray-500 font-medium">S/</span>}
                      className="pl-12 h-14 text-base rounded-xl"
                      disabled={formSubmitting || isRegisteringFuel}
                      error={formErrors.factorKm?.message}
                      onChange={handleInputChange("factorKm")}
                    />
                    <p className="text-xs text-muted-foreground -mt-2">
                      El factor km se multiplica por la distancia total recorrida
                    </p>

                    {factorKmValue && localTrip.totalKm && (
                      <div className="p-5 bg-white rounded-xl shadow-sm border border-orange-100">
                        <p className="text-sm text-gray-600 mb-1">Monto Calculado</p>
                        <p className="text-3xl font-bold text-orange-700">
                          S/ {(parseFloat(factorKmValue) * (localTrip.totalKm || 0)).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {factorKmValue} S/.km × {localTrip.totalKm} km
                        </p>
                      </div>
                    )}

                    <Button
                      onClick={() => handleSavingFuel()}
                      disabled={!factorKmValue || !!formErrors.factorKm || isRegisteringFuel}
                      className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold py-6 text-base rounded-xl shadow-md transition-all disabled:opacity-70"
                      size="lg"
                    >
                      {isRegisteringFuel ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Fuel className="h-5 w-5 mr-2" />
                          Guardar Combustible
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Combustible Registrado */}
              {localTrip.fuelAmount && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-md border border-blue-200">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Fuel className="h-6 w-6 text-blue-700" />
                    </div>
                    <h3 className="font-bold text-xl text-blue-800">Combustible Registrado</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-white rounded-xl text-center">
                      <p className="text-sm text-muted-foreground">Factor Km</p>
                      <p className="font-bold text-xl">S/ {localTrip.factorKm?.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">por km</p>
                    </div>
                    <div className="p-4 bg-white rounded-xl text-center">
                      <p className="text-sm text-muted-foreground">Galones</p>
                      <p className="font-bold text-xl">{localTrip.fuelGallons?.toString() || "-"}</p>
                      <p className="text-xs text-muted-foreground">galones</p>
                    </div>
                    <div className="col-span-2 p-5 bg-blue-600 rounded-xl text-center">
                      <p className="text-sm text-blue-100">Monto Total</p>
                      <p className="text-3xl font-bold text-white">S/ {localTrip.fuelAmount?.toFixed(2)}</p>
                      <p className="text-xs text-blue-200 mt-1">combustible</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Form>
        </GeneralSheet>
      </>
    </TooltipProvider>
  );
}