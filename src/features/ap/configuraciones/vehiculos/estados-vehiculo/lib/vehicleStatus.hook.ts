import { useQuery } from "@tanstack/react-query";
import {
  findVehicleStatusById,
  getAllVehicleStatus,
  getVehicleStatus,
} from "./vehicleStatus.actions";
import { VEHICLE_STATUS } from "./vehicleStatus.constants";
import {
  VehicleStatusResource,
  VehicleStatusResponse,
} from "./vehicleStatus.interface";

const { QUERY_KEY } = VEHICLE_STATUS;

export const useVehicleStatus = (params?: Record<string, any>) => {
  return useQuery<VehicleStatusResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVehicleStatus({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllVehicleStatus = (params?: Record<string, any>) => {
  return useQuery<VehicleStatusResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllVehicleStatus({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useVehicleStatusById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehicleStatusById(id),
    refetchOnWindowFocus: false,
  });
};
