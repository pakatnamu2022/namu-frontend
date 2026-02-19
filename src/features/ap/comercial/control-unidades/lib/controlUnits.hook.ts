import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CONTROL_UNITS } from "./controlUnits.constants";
import {
  ReceptionChecklistRequest,
  ReceptionChecklistResponse,
  ControlUnitsRequest,
  ControlUnitsResource,
  ControlUnitsResponse,
} from "./controlUnits.interface";
import { VehicleResource } from "@/features/ap/comercial/vehiculos/lib/vehicles.interface";
import {
  deleteReceptionChecklist,
  deleteControlUnits,
  findControlUnitsById,
  getAllControlUnits,
  getReceptionChecklistById,
  getControlUnits,
  getVehicleByShippingGuide,
  storeControlUnits,
  storeConsignment,
  updateReceptionChecklist,
  updateControlUnits,
  markAsReceived,
  cancelShippingGuide,
  sendControlUnitsToNubefact,
  queryControlUnitsFromNubefact,
} from "./controlUnits.actions";
import {
  successToast,
  errorToast,
  SUCCESS_MESSAGE,
  ERROR_MESSAGE,
} from "@/core/core.function";
import { toast } from "sonner";

const { QUERY_KEY } = CONTROL_UNITS;
const CHECKLIST_QUERY_KEY = "reception-checklists";

// Hooks para control de unidades
export const useControlUnits = (params?: Record<string, any>) => {
  return useQuery<ControlUnitsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getControlUnits({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllControlUnits = (params?: Record<string, any>) => {
  return useQuery<ControlUnitsResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllControlUnits({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useControlUnitsById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findControlUnitsById(id),
    refetchOnWindowFocus: false,
    enabled: id > 0,
  });
};

// Mutations para control de unidades
export const useCreateControlUnits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ControlUnitsRequest) => storeControlUnits(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useUpdateControlUnits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ControlUnitsRequest;
    }) => updateControlUnits(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export const useDeleteControlUnits = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteControlUnits(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(SUCCESS_MESSAGE(CONTROL_UNITS.MODEL, "delete"));
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(CONTROL_UNITS.MODEL, "delete", msg));
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

export const useVehicleByShippingGuide = (shippingGuideId: number) => {
  return useQuery<VehicleResource>({
    queryKey: [CHECKLIST_QUERY_KEY, "vehicle", shippingGuideId],
    queryFn: () => getVehicleByShippingGuide(shippingGuideId),
    refetchOnWindowFocus: false,
    enabled: shippingGuideId > 0,
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
      successToast("Checklist de recepción actualizado exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Error al actualizar el checklist de recepción",
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
      successToast("Checklist de recepción eliminado exitosamente");
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          "Error al eliminar el checklist de recepción",
      );
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

// Hook para crear guía de consignación
export const useCreateConsignment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ControlUnitsRequest) => storeConsignment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

// Hooks SUNAT / Dynamic
export const useSendControlUnitsToNubefact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => sendControlUnitsToNubefact(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (response.success) {
        successToast(response.message);
      } else {
        errorToast(response.message || "Error al enviar a Nubefact");
      }
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Error al enviar a Nubefact",
      );
    },
  });
};

export const useQueryControlUnitsFromNubefact = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => queryControlUnitsFromNubefact(id),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      if (response.success) {
        successToast(response.message);
      } else {
        errorToast(response.message || "Error al consultar estado en SUNAT");
      }
    },
    onError: (error: any) => {
      errorToast(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Error al consultar estado en SUNAT",
      );
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
