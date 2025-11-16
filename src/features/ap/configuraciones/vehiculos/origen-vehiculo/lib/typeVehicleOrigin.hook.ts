import { useQuery } from "@tanstack/react-query";
import {
  TypeVehicleOriginResource,
  TypeVehicleOriginResponse,
} from "./typeVehicleOrigin.interface";
import {
  findTypeVehicleOriginById,
  getAllTypeVehicleOrigin,
  getTypeVehicleOrigin,
} from "./typeVehicleOrigin.actions";
import { VEHICLE_ORIGIN } from "./typeVehicleOrigin.constants";

const { QUERY_KEY } = VEHICLE_ORIGIN;

export const useTypeVehicleOrigin = (params?: Record<string, any>) => {
  return useQuery<TypeVehicleOriginResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getTypeVehicleOrigin({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTypeVehicleOrigin = (params?: Record<string, any>) => {
  return useQuery<TypeVehicleOriginResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllTypeVehicleOrigin({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useTypeVehicleOriginById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findTypeVehicleOriginById(id),
    refetchOnWindowFocus: false,
  });
};
