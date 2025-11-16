import { useQuery } from "@tanstack/react-query";
import {
  findVehicleColorById,
  getAllVehicleColor,
  getVehicleColor,
} from "./vehicleColor.actions";
import {
  VehicleColorResource,
  VehicleColorResponse,
} from "./vehicleColor.interface";
import { VEHICLE_COLOR } from "./vehicleColor.constants";

const { QUERY_KEY } = VEHICLE_COLOR;

export const useVehicleColor = (params?: Record<string, any>) => {
  return useQuery<VehicleColorResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVehicleColor({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllVehicleColor = (params?: Record<string, any>) => {
  return useQuery<VehicleColorResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllVehicleColor({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useVehicleColorById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehicleColorById(id),
    refetchOnWindowFocus: false,
  });
};
