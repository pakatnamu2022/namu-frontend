import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  findHotelReservationById,
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
