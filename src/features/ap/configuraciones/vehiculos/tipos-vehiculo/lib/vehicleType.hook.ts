import { useQuery } from "@tanstack/react-query";
import {
  VehicleTypeResource,
  VehicleTypeResponse,
} from "./vehicleType.interface";
import {
  findVehicleTypeById,
  getAllVehicleType,
  getVehicleType,
} from "./vehicleType.actions";
import { VEHICLE_TYPE } from "./vehicleType.constants";

const { QUERY_KEY } = VEHICLE_TYPE;

export const useVehicleType = (params?: Record<string, any>) => {
  return useQuery<VehicleTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVehicleType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllVehicleType = (params?: Record<string, any>) => {
  return useQuery<VehicleTypeResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllVehicleType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useVehicleTypeById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehicleTypeById(id),
    refetchOnWindowFocus: false,
  });
};
