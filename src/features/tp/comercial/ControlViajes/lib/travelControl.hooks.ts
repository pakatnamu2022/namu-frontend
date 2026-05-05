// travelControl.hooks.ts - Añadir nuevo hook

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiResponse, GetTripsProps, TravelControlResource, TravelControlResponse, TripStatus, UpdateSubTripParams, UpdateSubTripResponse, SubTrip, UpdateMileageParams } from '@/features/tp/comercial/ControlViajes/lib/travelControl.interface';
import { changeStatus, endRoute, getAvailableStatuses, getDriverRegistries, getLastMileage, getTravels, registerFuel, startRoute, updateSubTrip, validateMileage, getSubTrips, getSegments, getSegmentsProgress, endSegment, startSegment, updateTravelMileage, exportSummaryReport } from './travelControl.actions';
import { TRAVEL_CONTROL } from '../controlViajesType/travelControl.constants';
import { exportTravelReport } from './travelControl.actions';
import { errorToast, successToast } from '@/core/core.function';
import { exportAllTravelsReport } from './travelControl.actions';
const { QUERY_KEY } = TRAVEL_CONTROL;

// Hook para obtener los viajes
export const useTravels = (props?: GetTripsProps) => {
    return useQuery<TravelControlResponse>({
        queryKey: [QUERY_KEY, props],
        queryFn: () => getTravels(props || {}),
        refetchOnWindowFocus: false,
    });
};

export const useFilteredTravels = (
    filters: {
        search?: string;
        status?: TripStatus | 'all',
        page?: number;
        per_page?: number;
    }
) => {
    return useTravels(filters);
};

// hook para buscar viajes
export const useSearchTravels = (search?: string) => {
    return useTravels({search});
};

export const useTravelByStatus = (status?: TripStatus | 'all') => {
    return useTravels({ status });
};

export const useLastMileage = (vehicleId?: string) => {
    return useQuery<number>({
        queryKey: [QUERY_KEY, 'mileage', vehicleId],
        queryFn: () => getLastMileage(vehicleId!),
        enabled: !!vehicleId,
        refetchOnWindowFocus: false,
    });
};

export const useValidateMileage = (vehicleId?: string | number) => {
    return useQuery<ApiResponse<{ ultimo_kilometraje: number, mensaje: string }>>({
        queryKey: [QUERY_KEY, 'validate-km', vehicleId],
        queryFn: () => validateMileage(vehicleId!),
        enabled: !!vehicleId,
        refetchOnWindowFocus: false,
    });
};

export const useAvailableStatuses = () => {
    return useQuery<ApiResponse<any[]>>({
        queryKey: [QUERY_KEY, 'states'],
        queryFn: getAvailableStatuses,
        refetchOnWindowFocus: false,
    });
};

export const useDriverRegistries = (tripId?: string) => {
    return useQuery<ApiResponse<any[]>>({
        queryKey: [QUERY_KEY, 'records', tripId],
        queryFn: () => getDriverRegistries(tripId!),
        enabled: !!tripId,
        refetchOnWindowFocus: false,
    });
};

export const useStartRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { id: string; mileage: number; notes?: string }) =>
      startRoute(params),
    onSuccess: (data: TravelControlResource, variables) => { 
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.id] });
      return data;
    },
  });
};

export const useEndRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: { id: string; mileage: number; notes?: string; tonnage?: number }) =>
      endRoute(params),
    onSuccess: (data: TravelControlResource, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.id] });
      return data;
    },
  });
};

export const useRegisterFuel = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (params: {
      id: string;
      kmFactor: number;
      notes?: string;
      invoice_travel?: string;
      documentNumber?: string;
      vatNumber?: string;
    }) => registerFuel(params),
    onSuccess: (data: { travel: TravelControlResource; fuel: any }, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.id] });
      return data;
    },
  });
};

export const useChangeStatus = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (params: { id: string; state: TripStatus; notes?: string }) =>
            changeStatus(params),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.id] });
        },
    });
};

// Nuevo hook para actualizar SubTrips
export const useUpdateSubTrip = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (params: UpdateSubTripParams) => updateSubTrip(params),
        onSuccess: (data: UpdateSubTripResponse, variables) => {
            // Invalidar queries relacionadas
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.id] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'subtrips'] });
            return data;
        },
    });
};

// Hook para obtener SubTrips de un viaje específico
export const useSubTrips = (dispatchId?: string) => {
    return useQuery<SubTrip[]>({
        queryKey: [QUERY_KEY, 'subtrips', dispatchId],
        queryFn: () => getSubTrips(dispatchId!),
        enabled: !!dispatchId,
        refetchOnWindowFocus: false,
    });
};


// ==================== HOOKS PARA SEGMENTOS (SUBTRIPS) ====================

/**
 * Hook para iniciar un segmento
 */
export const useStartSegment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (params: {
            travelId: string;
            segmentId: string;
            mileage: number;
            latitude?: number | null;
            longitude?: number | null;
        }) => startSegment(params),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.travelId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'segments', variables.travelId] });
        },
    });
};

/**
 * Hook para finalizar un segmento
 */
export const useEndSegment = () => {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (params: {
            travelId: string;
            segmentId: string;
            mileage: number;
            latitude?: number | null;
            longitude?: number | null;
            tonnage?: number;
        }) => endSegment(params),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.travelId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'segments', variables.travelId] });
        },
    });
};

/**
 * Hook para obtener los segmentos de un viaje
 */
export const useSegments = (travelId?: string) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'segments', travelId],
        queryFn: () => getSegments(travelId!),
        enabled: !!travelId,
        refetchOnWindowFocus: false,
    });
};

/**
 * Hook para obtener el progreso de los segmentos
 */
export const useSegmentsProgress = (travelId?: string) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'segments-progress', travelId],
        queryFn: () => getSegmentsProgress(travelId!),
        enabled: !!travelId,
        refetchOnWindowFocus: false,
    });
};

export const useExportTravelReport = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ travelId, format}: {travelId: string; format?: 'excel' | 'pdf'}) =>
            exportTravelReport(travelId, format),
        onSuccess: () => {
            successToast('El reporte se ha descargado correctamente');
        },
        onError: (error: any) => {
            errorToast(
                error?.message || 'Ocurrió un error al descargar el reporte'
            );
        },
    });
};
export const useExportAllTravelsReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ format, filters }: { format?: 'excel' | 'pdf'; filters?: any }) =>
      exportAllTravelsReport(format, filters),
    onSuccess: () => {
      successToast('El reporte general se ha descargado correctamente');
    },
    onError: (error: any) => {
      errorToast(
        error?.message || 'Ocurrió un error al descargar el reporte general'
      );
    },
  });
};

export const useUpdateTravelMileage = () => {
    const queryClient = useQueryClient();


    return useMutation({
        mutationFn: (params: UpdateMileageParams) => updateTravelMileage(params),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY]});
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.id]});
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'segments', variables.id]});

            successToast('Kilometrajes actualizados correctamente');
        },

        onError: (error: any) => {
            errorToast(error.message || 'Error al actualizar los kilometrajes');
        },
    });
};

export const useExportSummaryReport = () => {
    return useMutation({
        mutationFn: ({ format, filters }: { format?: 'excel' | 'pdf'; filters?: any }) =>
            exportSummaryReport(format, filters),
        onSuccess: () => {
            successToast('El reporte resumido se ha descargado correctamente');
        },
        onError: (error: any) => {
            errorToast(error?.message || 'Ocurrió un error al descargar el reporte resumido');
        },
    });
};