import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VehiclesDeliveryResponse } from "./vehicleDelivery.interface";
import {
  findVehicleDeliveryById,
  getVehiclesDelivery,
  updateVehicleDelivery,
  sendVehicleDeliveryToNubefact,
  generateOrUpdateShippingGuide,
  queryVehicleDeliveryFromNubefact,
  sendVehicleDeliveryToDynamic,
  getNextShippingGuideDocumentNumber,
} from "./vehicleDelivery.actions";
import { VEHICLE_DELIVERY } from "./vehicleDelivery.constants";
import { successToast, errorToast } from "@/core/core.function";

const { QUERY_KEY } = VEHICLE_DELIVERY;

export const useVehicleDelivery = (params?: Record<string, any>) => {
  return useQuery<VehiclesDeliveryResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVehiclesDelivery({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useVehicleDeliveryById = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehicleDeliveryById(id),
    refetchOnWindowFocus: false,
    enabled: enabled && id > 0,
  });
};

export const useUpdateVehicleDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      updateVehicleDelivery(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

// Hook para enviar a Nubefact
export const useSendVehicleDeliveryToNubefact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sendVehicleDeliveryToNubefact(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

      if (response.success) {
        // Solo mostrar el mensaje del servidor
        successToast(response.message);
      } else {
        errorToast(
          response.message || "Error al enviar la guía de remisión a Nubefact"
        );
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al enviar la guía de remisión a Nubefact";

      errorToast(errorMessage);

      // Si hay errores de validación adicionales, mostrarlos
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          errorToast(`${key}: ${errors[key].join(", ")}`);
        });
      }
    },
  });
};

// Hook para consultar estado en Nubefact
export const useQueryVehicleDeliveryFromNubefact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => queryVehicleDeliveryFromNubefact(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });

      if (response.success) {
        successToast(response.message);
      } else {
        errorToast(
          response.message || "Error al consultar el estado de la guía"
        );
      }
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al consultar el estado de la guía";

      errorToast(errorMessage);

      // Si hay errores de validación adicionales, mostrarlos
      if (error?.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach((key) => {
          errorToast(`${key}: ${errors[key].join(", ")}`);
        });
      }
    },
  });
};

// Hook para generar o actualizar guía de remisión
export const useGenerateOrUpdateShippingGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      generateOrUpdateShippingGuide(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

// Hook para enviar a Dynamic
export const useSendVehicleDeliveryToDynamic = () => {
  return useMutation({
    mutationFn: (id: number) => sendVehicleDeliveryToDynamic(id),
  });
};

// Hook para obtener el siguiente número de guía de remisión
export const useNextShippingGuideDocumentNumber = (
  documentSeriesId?: number
) => {
  return useQuery({
    queryKey: ["shippingGuide", "next-document-number", documentSeriesId],
    queryFn: () => getNextShippingGuideDocumentNumber(documentSeriesId!),
    enabled: !!documentSeriesId,
    refetchOnWindowFocus: false,
  });
};
