import { useQuery } from "@tanstack/react-query";
import {
  EquipmentTypeResource,
  EquipmentTypeResponse,
} from "./equipmentType.interface";
import { getAllEquipmentType, getEquipmentType } from "./equipmentType.actions";

export const useEquipmentTypes = (params?: Record<string, any>) => {
  return useQuery<EquipmentTypeResponse>({
    queryKey: ["equipmentType", params],
    queryFn: () => getEquipmentType({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllEquipmentTypes = () => {
  return useQuery<EquipmentTypeResource[]>({
    queryKey: ["equipmentTypeAll"],
    queryFn: () => getAllEquipmentType(),
    refetchOnWindowFocus: false,
  });
};
