import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiResponse, GetTripsProps, TravelControlResource, TravelControlResponse, TripStatus } from '@/features/tp/comercial/ControlViajes/lib/travelControl.interface';
import { changeStatus, endRoute, getAvailableStatuses, getDriverRegistries, getLastMileage, getTravels, registerFuel, startRoute, validateMileage} from './travelControl.actions';
import { TRAVEL_CONTROL } from '../controlViajesType/travelControl.constants';

const { QUERY_KEY } = TRAVEL_CONTROL;


//Hook para obtener los viajes
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


//hook para buscar viajes
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
    onSuccess: (data: TravelControlResource, variables) => { // Especificar tipo
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
    onSuccess: (data: { travel: TravelControlResource; fuel: any }, variables) => { // Especificar tipo
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




