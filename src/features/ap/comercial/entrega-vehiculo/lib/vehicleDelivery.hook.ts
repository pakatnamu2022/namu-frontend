import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DiagnoseVinResponse, VehiclesDeliveryResponse } from "./vehicleDelivery.interface";
import {
  findVehicleDeliveryById,
  getVehiclesDelivery,
  updateVehicleDelivery,
  sendVehicleDeliveryToNubefact,
  generateOrUpdateShippingGuide,
  queryVehicleDeliveryFromNubefact,
  getNextShippingGuideDocumentNumber,
  syncAccountingEntry,
  syncShippingGuideWithDynamics,
  getAvailableDeliverySlots,
  rescheduleVehicleDelivery,
  diagnoseVehicleDeliveryVin,
  getVehicleDeliveryRescheduleHistory,
  approveExtraordinaryVehicleDelivery,
  rejectExtraordinaryVehicleDelivery,
} from "./vehicleDelivery.actions";
import { VEHICLE_DELIVERY } from "./vehicleDelivery.constants";
import { successToast, errorToast, promiseToast } from "@/core/core.function";

const { QUERY_KEY } = VEHICLE_DELIVERY;

export const useVehicleDelivery = (params?: Record<string, any>) => {
  return useQuery<VehiclesDeliveryResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVehiclesDelivery({ params }),
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

export const useRescheduleVehicleDelivery = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: {
        scheduled_delivery_date: string;
        observations?: string;
        is_extraordinary?: boolean;
      };
    }) => rescheduleVehicleDelivery(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast("Entrega reprogramada correctamente");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Error al reprogramar la entrega";
      errorToast(msg);
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
          response.message || "Error al enviar la guía de remisión a Nubefact",
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
          response.message || "Error al consultar el estado de la guía",
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

export const useSyncAccountingEntry = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => syncAccountingEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast("Asiento contable sincronizado correctamente");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al sincronizar el asiento contable";
      errorToast(msg);
    },
  });
};

// Hook para sincronizar guía de remisión con Dynamics
export const useSyncShippingGuideWithDynamics = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => {
      const promise = syncShippingGuideWithDynamics(id);
      promiseToast(promise, {
        id: `sync-shipping-guide-dynamics-${id}`,
        loading: "Consultando estado en Dynamics...",
        success: (response) =>
          response.message || "Guía sincronizada con Dynamics",
        error: (error: any) =>
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Error al sincronizar la guía con Dynamics",
      });
      return promise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useAvailableDeliverySlots = (date?: string, shopId?: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, "available-slots", date, shopId],
    queryFn: () => getAvailableDeliverySlots(date!, shopId),
    enabled: !!date,
    refetchOnWindowFocus: false,
  });
};

// Hook para diagnosticar por qué un VIN no aparece en la lista de entregas
export const useDiagnoseVehicleDeliveryVin = () => {
  return useMutation<DiagnoseVinResponse, any, { vin: string; sedeId?: number }>({
    mutationFn: ({ vin, sedeId }) => diagnoseVehicleDeliveryVin(vin, sedeId),
    onSuccess: (response) => {
      if (response.success === false) {
        errorToast(response.message || "No se pudo diagnosticar el VIN");
      }
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message || "Error al diagnosticar el VIN";
      errorToast(msg);
    },
  });
};

// Hook para obtener el historial de reprogramaciones de una entrega
export const useVehicleDeliveryRescheduleHistory = (
  id: number,
  enabled: boolean = true,
) => {
  return useQuery({
    queryKey: [QUERY_KEY, id, "reschedule-history"],
    queryFn: () => getVehicleDeliveryRescheduleHistory(id),
    enabled: enabled && id > 0,
    refetchOnWindowFocus: false,
  });
};

// Hook para aprobar una entrega extraordinaria
export const useApproveExtraordinaryVehicleDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => approveExtraordinaryVehicleDelivery(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.setQueryData([QUERY_KEY, data.id], data);
      successToast("Entrega extraordinaria aprobada correctamente");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Error al aprobar la entrega extraordinaria";
      errorToast(msg);
    },
  });
};

// Hook para rechazar (anular) una entrega extraordinaria
export const useRejectExtraordinaryVehicleDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => rejectExtraordinaryVehicleDelivery(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.setQueryData([QUERY_KEY, data.id], data);
      successToast("Entrega extraordinaria anulada correctamente");
    },
    onError: (error: any) => {
      const msg =
        error?.response?.data?.message ||
        "Error al anular la entrega extraordinaria";
      errorToast(msg);
    },
  });
};

// Hook para obtener el siguiente número de guía de remisión
export const useNextShippingGuideDocumentNumber = (
  documentSeriesId?: number,
) => {
  return useQuery({
    queryKey: ["shippingGuide", "next-document-number", documentSeriesId],
    queryFn: () => getNextShippingGuideDocumentNumber(documentSeriesId!),
    enabled: !!documentSeriesId,
    refetchOnWindowFocus: false,
  });
};
