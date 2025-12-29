import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteVehicleInspection,
  findVehicleInspectionById,
  findVehicleInspectionByWorkOrderId,
  getAllVehicleInspection,
  getVehicleInspection,
  storeVehicleInspection,
  updateVehicleInspection,
  uploadInspectionPhoto,
} from "./vehicleInspection.actions";
import {
  getVehicleInspectionProps,
  VehicleInspectionRequest,
} from "./vehicleInspection.interface";
import { VEHICLE_INSPECTION } from "./vehicleInspection.constants";
import { errorToast, successToast } from "@/core/core.function";

const { QUERY_KEY, MODEL } = VEHICLE_INSPECTION;

export function useGetVehicleInspection(props: getVehicleInspectionProps) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getVehicleInspection(props),
  });
}

export function useGetAllVehicleInspection(props: getVehicleInspectionProps) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", props],
    queryFn: () => getAllVehicleInspection(props),
  });
}

export function useFindVehicleInspectionById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehicleInspectionById(id),
    enabled: !!id,
  });
}

export function useFindVehicleInspectionByWorkOrderId(workOrderId?: number) {
  return useQuery({
    queryKey: [QUERY_KEY, "work-order", workOrderId],
    queryFn: () => findVehicleInspectionByWorkOrderId(workOrderId!),
    enabled: !!workOrderId,
  });
}

export function useStoreVehicleInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: VehicleInspectionRequest) =>
      storeVehicleInspection(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(`${MODEL.name} registrad${MODEL.gender ? "a" : "o"}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        `Error al registrar ${MODEL.gender ? "la" : "el"} ${MODEL.name.toLowerCase()}`;
      errorToast(errorMessage);
    },
  });
}

export function useUpdateVehicleInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: VehicleInspectionRequest }) =>
      updateVehicleInspection(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.id] });
      successToast(`${MODEL.name} actualizad${MODEL.gender ? "a" : "o"}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        `Error al actualizar ${MODEL.gender ? "la" : "el"} ${MODEL.name.toLowerCase()}`;
      errorToast(errorMessage);
    },
  });
}

export function useDeleteVehicleInspection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteVehicleInspection(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(`${MODEL.name} eliminad${MODEL.gender ? "a" : "o"}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        `Error al eliminar ${MODEL.gender ? "la" : "el"} ${MODEL.name.toLowerCase()}`;
      errorToast(errorMessage);
    },
  });
}

export function useUploadInspectionPhoto() {
  return useMutation({
    mutationFn: (file: File) => uploadInspectionPhoto(file),
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al subir la foto";
      errorToast(errorMessage);
    },
  });
}
