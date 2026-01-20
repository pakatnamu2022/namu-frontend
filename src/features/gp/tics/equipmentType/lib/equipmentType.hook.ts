import { useQuery } from "@tanstack/react-query";
import {
  EquipmentTypeResource,
  EquipmentTypeResponse,
} from "./equipmentType.interface";
import {
  findEquipmentTypeById,
  getAllEquipmentType,
  getEquipmentType,
} from "./equipmentType.actions";
import { EQUIPMENT_TYPE } from "./equipmentType.constants";

const { QUERY_KEY } = EQUIPMENT_TYPE;

export const useEquipmentTypes = (params?: Record<string, any>) => {
  return useQuery<EquipmentTypeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEquipmentType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllEquipmentTypes = () => {
  return useQuery<EquipmentTypeResource[]>({
    queryKey: [`${QUERY_KEY}All`],
    queryFn: () => getAllEquipmentType(),
    refetchOnWindowFocus: false,
  });
};

export const useEquipmentTypeById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findEquipmentTypeById(id),
    refetchOnWindowFocus: false,
  });
};
