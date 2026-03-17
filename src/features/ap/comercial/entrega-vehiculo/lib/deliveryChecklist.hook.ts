import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { successToast, errorToast } from "@/core/core.function";
import {
  getDeliveryChecklist,
  createDeliveryChecklist,
  updateDeliveryChecklist,
  updateDeliveryChecklistItem,
  addDeliveryChecklistItem,
  deleteDeliveryChecklistItem,
  confirmDeliveryChecklist,
  downloadDeliveryChecklistPdf,
} from "./deliveryChecklist.actions";

export const DELIVERY_CHECKLIST_QUERY_KEY = "deliveryChecklist";

const getErrorMessage = (error: any, fallback: string): string =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  fallback;

export const useDeliveryChecklist = (vehicleDeliveryId: number) => {
  return useQuery({
    queryKey: [DELIVERY_CHECKLIST_QUERY_KEY, vehicleDeliveryId],
    queryFn: () => getDeliveryChecklist(vehicleDeliveryId),
    enabled: vehicleDeliveryId > 0,
    refetchOnWindowFocus: false,
  });
};

export const useCreateDeliveryChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDeliveryChecklist,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [DELIVERY_CHECKLIST_QUERY_KEY, data.vehicle_delivery_id],
      });
      successToast("Checklist creado exitosamente");
    },
    onError: (error: any) =>
      errorToast(getErrorMessage(error, "Error al crear el checklist")),
  });
};

export const useUpdateDeliveryChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      vehicleDeliveryId: number;
      data: { observations?: string | null };
    }) => updateDeliveryChecklist(id, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [DELIVERY_CHECKLIST_QUERY_KEY, vars.vehicleDeliveryId],
      });
      successToast("Observaciones guardadas");
    },
    onError: (error: any) =>
      errorToast(getErrorMessage(error, "Error al guardar las observaciones")),
  });
};

export const useUpdateDeliveryChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      checklistId,
      itemId,
      data,
    }: {
      checklistId: number;
      itemId: number;
      vehicleDeliveryId: number;
      data: {
        is_confirmed?: boolean;
        observations?: string | null;
        quantity?: number;
        description?: string;
        unit?: string | null;
      };
    }) => updateDeliveryChecklistItem(checklistId, itemId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [DELIVERY_CHECKLIST_QUERY_KEY, vars.vehicleDeliveryId],
      });
    },
    onError: (error: any) =>
      errorToast(getErrorMessage(error, "Error al actualizar el ítem")),
  });
};

export const useAddDeliveryChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      checklistId,
      data,
    }: {
      checklistId: number;
      vehicleDeliveryId: number;
      data: {
        description: string;
        quantity: number;
        unit?: string | null;
        observations?: string | null;
      };
    }) => addDeliveryChecklistItem(checklistId, data),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [DELIVERY_CHECKLIST_QUERY_KEY, vars.vehicleDeliveryId],
      });
      successToast("Ítem agregado");
    },
    onError: (error: any) =>
      errorToast(getErrorMessage(error, "Error al agregar el ítem")),
  });
};

export const useDeleteDeliveryChecklistItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      checklistId,
      itemId,
    }: {
      checklistId: number;
      itemId: number;
      vehicleDeliveryId: number;
    }) => deleteDeliveryChecklistItem(checklistId, itemId),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: [DELIVERY_CHECKLIST_QUERY_KEY, vars.vehicleDeliveryId],
      });
      successToast("Ítem eliminado");
    },
    onError: (error: any) =>
      errorToast(getErrorMessage(error, "Error al eliminar el ítem")),
  });
};

export const useConfirmDeliveryChecklist = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => confirmDeliveryChecklist(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: [DELIVERY_CHECKLIST_QUERY_KEY, data.vehicle_delivery_id],
      });
      successToast("Checklist confirmado exitosamente");
    },
    onError: (error: any) =>
      errorToast(getErrorMessage(error, "Error al confirmar el checklist")),
  });
};

export const useDownloadDeliveryChecklistPdf = () => {
  return useMutation({
    mutationFn: (id: number) => downloadDeliveryChecklistPdf(id),
    onSuccess: () => successToast("PDF descargado"),
    onError: (error: any) =>
      errorToast(getErrorMessage(error, "Error al descargar el PDF")),
  });
};
