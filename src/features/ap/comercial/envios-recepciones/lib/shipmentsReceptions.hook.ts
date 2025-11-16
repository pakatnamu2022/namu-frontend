import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SHIPMENTS_RECEPTIONS } from "./shipmentsReceptions.constants";
import {
  ReceptionChecklistRequest,
  ReceptionChecklistResponse,
  ShipmentsReceptionsRequest,
  ShipmentsReceptionsResource,
  ShipmentsReceptionsResponse,
} from "./shipmentsReceptions.interface";
import {
  deleteReceptionChecklist,
  deleteShipmentsReceptions,
  findShipmentsReceptionsById,
  getAllShipmentsReceptions,
  getReceptionChecklistById,
  getShipmentsReceptions,
  queryShippingGuideFromNubefact,
  sendShippingGuideToNubefact,
  storeShipmentsReceptions,
  updateReceptionChecklist,
  updateShipmentsReceptions,
  markAsReceived,
  cancelShippingGuide,
} from "./shipmentsReceptions.actions";
import { successToast, errorToast } from "@/src/core/core.function";
import { toast } from "sonner";

const { QUERY_KEY } = SHIPMENTS_RECEPTIONS;
const CHECKLIST_QUERY_KEY = "reception-checklists";

// Hooks para guías de remisión
export const useShipmentsReceptions = (params?: Record<string, any>) => {
  return useQuery<ShipmentsReceptionsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getShipmentsReceptions({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllShipmentsReceptions = (params?: Record<string, any>) => {
  return useQuery<ShipmentsReceptionsResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllShipmentsReceptions({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useShipmentsReceptionsById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findShipmentsReceptionsById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};

// Mutations para guías de remisión
export const useCreateShipmentsReceptions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ShipmentsReceptionsRequest) =>
      storeShipmentsReceptions(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateShipmentsReceptions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ShipmentsReceptionsRequest;
    }) => updateShipmentsReceptions(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useDeleteShipmentsReceptions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteShipmentsReceptions(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Guía de remisión eliminada exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Error al eliminar la guía de remisión"
      );
    },
  });
};

// Hooks para checklist de recepción
export const useReceptionChecklistById = (id: number) => {
  return useQuery<ReceptionChecklistResponse>({
    queryKey: [CHECKLIST_QUERY_KEY, id],
    queryFn: () => getReceptionChecklistById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};

export const useUpdateReceptionChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ReceptionChecklistRequest;
    }) => updateReceptionChecklist(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHECKLIST_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Checklist de recepción actualizado exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Error al actualizar el checklist de recepción"
      );
    },
  });
};

export const useDeleteReceptionChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteReceptionChecklist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [CHECKLIST_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success("Checklist de recepción eliminado exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Error al eliminar el checklist de recepción"
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

// Hook para marcar como recibido (solo para traslado entre almacenes)
export const useMarkAsReceived = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, note }: { id: number; note?: string }) =>
      markAsReceived(id, note),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(
        response.message || "Guía marcada como recibida exitosamente"
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
