import { useQuery } from "@tanstack/react-query";
import { FuelTypeResource, FuelTypeResponse } from "./fuelType.interface";
import {
  findFuelTypeById,
  getAllFuelType,
  getFuelType,
} from "./fuelType.actions";
import { FUEL_TYPE } from "./fuelType.constants";

const { QUERY_KEY } = FUEL_TYPE;

export const useFuelType = (params?: Record<string, any>) => {
  return useQuery<FuelTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getFuelType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllFuelType = (params?: Record<string, any>) => {
  return useQuery<FuelTypeResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllFuelType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useFuelTypeById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findFuelTypeById(id),
    refetchOnWindowFocus: false,
  });
};
