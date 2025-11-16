import { useQuery } from "@tanstack/react-query";
import { UNIT_MEASUREMENT } from "./unitMeasurement.constants";
import {
  UnitMeasurementResource,
  UnitMeasurementResponse,
} from "./unitMeasurement.interface";
import {
  findUnitMeasurementById,
  getAllUnitMeasurement,
  getUnitMeasurement,
} from "./unitMeasurement.actions";

const { QUERY_KEY } = UNIT_MEASUREMENT;

export const useUnitMeasurement = (params?: Record<string, any>) => {
  return useQuery<UnitMeasurementResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getUnitMeasurement({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllUnitMeasurement = (params?: Record<string, any>) => {
  return useQuery<UnitMeasurementResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllUnitMeasurement({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useUnitMeasurementById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findUnitMeasurementById(id),
    refetchOnWindowFocus: false,
  });
};
