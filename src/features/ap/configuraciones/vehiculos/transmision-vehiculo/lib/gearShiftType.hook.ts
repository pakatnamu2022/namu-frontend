import { useQuery } from "@tanstack/react-query";
import {
  GearShiftTypeResource,
  GearShiftTypeResponse,
} from "./gearShiftType.interface";
import {
  findGearShiftTypeById,
  getAllGearShiftType,
  getGearShiftType,
} from "./gearShiftType.actions";
import { TYPE_TRANSMISSION } from "./gearShiftType.constants";

const { QUERY_KEY } = TYPE_TRANSMISSION;

export const useGearShiftType = (params?: Record<string, any>) => {
  return useQuery<GearShiftTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getGearShiftType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllGearShiftType = (params?: Record<string, any>) => {
  return useQuery<GearShiftTypeResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllGearShiftType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useGearShiftTypeById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findGearShiftTypeById(id),
    refetchOnWindowFocus: false,
  });
};
