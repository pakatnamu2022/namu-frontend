import { useQuery } from "@tanstack/react-query";
import { VehicleAssignmentControlResponse } from "./vehicleAssignment.interface";
import {
  DriverSearchParams,
  DriverSearchResponse,
  findVehicleAssignmentById,
  FormDataResponse,
  getFormData,
  getVehicleAssignment,
  searchDrivers,
} from "./vehicleAssignment.actions";

export const useVehicleAssignmentControl = (params?: Record<string, any>) => {
  return useQuery<VehicleAssignmentControlResponse>({
    queryKey: ["opVehicleAssignment", params],
    queryFn: () => getVehicleAssignment({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useVehicleAssignmentById = (id: number) => {
  return useQuery({
    queryKey: ["opVehicleAssignment", id],
    queryFn: () => findVehicleAssignmentById(id),
    refetchOnWindowFocus: false,
  });
};

export const useFormData = () => {
  return useQuery<FormDataResponse>({
    queryKey: ["opVehicleAssignment-form-data"],
    queryFn: getFormData,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
  });
};

export const useDriverAssignmentSearch = (params?: DriverSearchParams) => {
  return useQuery<DriverSearchResponse>({
    queryKey: ["driver-search", params],
    queryFn: () => searchDrivers(params || {}),
    refetchOnWindowFocus: false,
    staleTime: 2 * 60 * 1000,
    enabled: !!params && !!params.search,
  });
};
