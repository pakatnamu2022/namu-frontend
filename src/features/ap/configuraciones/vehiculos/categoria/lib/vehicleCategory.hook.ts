import { useQuery } from "@tanstack/react-query";
import { VehicleCategoryResponse } from "./vehicleCategory.interface";
import {
  findVehicleCategoryById,
  getVehicleCategory,
} from "./vehicleCategory.actions";
import { VEHICLE_CATEGORY } from "./vehicleCategory.constants";

const { QUERY_KEY } = VEHICLE_CATEGORY;

export const useVehicleCategory = (params?: Record<string, any>) => {
  return useQuery<VehicleCategoryResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getVehicleCategory({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useVehicleCategoryById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findVehicleCategoryById(id),
    refetchOnWindowFocus: false,
  });
};
