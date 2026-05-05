import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  findHotelReservationById,
  releaseHotelReservation,
  updateHotelReservation,
} from "./hotelReservation.actions";
import { PER_DIEM_REQUEST } from "./perDiemRequest.constants";

export const HOTEL_RESERVATION_QUERY_KEY = "hotel-reservation";

/**
 * Hook para obtener una reserva de hotel por ID
 */
export function useHotelReservation(reservationId: number) {
  return useQuery({
    queryKey: [HOTEL_RESERVATION_QUERY_KEY, reservationId],
    queryFn: () => findHotelReservationById(reservationId),
    enabled: !!reservationId,
  });
}

/**
 * Hook para liberar una reserva de hotel, permitiendo que la solicitud pueda cancelarse
 */
export function useReleaseHotelReservation(
  reservationId: number,
  requestId: number | string,
  options?: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
  },
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => releaseHotelReservation(reservationId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY, String(requestId)],
      });
      await queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY],
      });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      options?.onError?.(error);
    },
  });
}

/**
 * Hook para actualizar una reserva de hotel
 */
export function useUpdateHotelReservation(
  reservationId: number,
  requestId: number,
  options?: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) =>
      updateHotelReservation(reservationId, formData),
    onSuccess: async () => {
      // Invalidar queries para refrescar los datos
      await queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY, requestId],
      });
      await queryClient.invalidateQueries({
        queryKey: [HOTEL_RESERVATION_QUERY_KEY, reservationId],
      });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      options?.onError?.(error);
    },
  });
}
