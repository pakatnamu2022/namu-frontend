import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { successToast, errorToast } from "@/core/core.function";
import { toast } from "sonner";
import {
  getShippingGuides,
  getAllShippingGuides,
  findShippingGuidesById,
  storeShippingGuides,
  updateShippingGuides,
  deleteShippingGuides,
  sendShippingGuideToNubefact,
  queryShippingGuideFromNubefact,
  markAsReceived,
  cancelShippingGuide,
  getNextShippingGuideDocumentNumber,
} from "./shippingGuides.actions";
import { SHIPPING_GUIDES } from "./shippingGuides.constants";
import {
  ShippingGuidesResponse,
  ShippingGuidesResource,
  ShippingGuidesRequest,
} from "./shippingGuides.interface";

const { QUERY_KEY } = SHIPPING_GUIDES;

// Hooks para guías de remisión
export const useShippingGuides = (params?: Record<string, any>) => {
  return useQuery<ShippingGuidesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getShippingGuides({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllShippingGuides = (params?: Record<string, any>) => {
  return useQuery<ShippingGuidesResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllShippingGuides({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useShippingGuidesById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findShippingGuidesById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};

// Mutations para guías de remisión
export const useCreateShippingGuides = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShippingGuidesRequest) =>
      storeShippingGuides(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateShippingGuides = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ShippingGuidesRequest;
    }) => updateShippingGuides(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useDeleteShippingGuides = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteShippingGuides(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast("Guía de remisión eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Error al eliminar la guía de remisión",
      );
    },
  });
};

// Hook para enviar a Nubefact
export const useSendShippingGuideToNubefact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sendShippingGuideToNubefact(id),
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
export const useQueryShippingGuideFromNubefact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => queryShippingGuideFromNubefact(id),
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

// Hook para marcar como recibido (solo para traslado entre almacenes)
export const useMarkAsReceived = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      markAsReceived(id, note),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(
        response.message || "Guía marcada como recibida exitosamente",
      );
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al marcar la guía como recibida";

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

// Hook para cancelar guía de remisión
export const useCancelShippingGuide = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      cancellation_reason,
    }: {
      id: number;
      cancellation_reason: string;
    }) => cancelShippingGuide(id, cancellation_reason),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(response.message || "Guía cancelada exitosamente");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Error al cancelar la guía de remisión";

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

// Hook para obtener el siguiente número de documento
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
