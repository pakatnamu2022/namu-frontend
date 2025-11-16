import { useQuery } from "@tanstack/react-query";
import { VEHICLES } from "./vehicles.constants";
import { VehicleResource, VehicleResourceWithCosts, VehicleResponse, VehicleClientDebtInfo } from "./vehicles.interface";
import {
  findVehicleById,
  getAllVehicles,
  getAllVehiclesWithCosts,
  getVehicles,
  getVehicleClientDebtInfo,
} from "./vehicles.actions";

const { QUERY_KEY } = VEHICLES;

export const useAllVehicles = (params?: Record<string, any>) => {
  return useQuery<VehicleResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAllVehicles({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllVehiclesWithCosts = (params?: Record<string, any>) => {
  return useQuery<VehicleResourceWithCosts[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllVehiclesWithCosts({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useVehicles = (params?: Record<string, any>) => {
  return useQuery<VehicleResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVehicles({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useVehicleById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehicleById(id),
    refetchOnWindowFocus: false,
  });
};

export const useVehicleClientDebtInfo = (vehicleId: number | null) => {
  return useQuery<VehicleClientDebtInfo>({
    queryKey: [QUERY_KEY, "client-debt-info", vehicleId],
    queryFn: () => getVehicleClientDebtInfo(vehicleId!),
    enabled: !!vehicleId,
    refetchOnWindowFocus: false,
  });
};
