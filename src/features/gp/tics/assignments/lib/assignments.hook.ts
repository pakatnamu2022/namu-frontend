import { useQuery } from "@tanstack/react-query";
import {
  EquipmentAssignmentListResponse,
  PhoneLineAssignmentListResponse,
} from "./assignments.interface";
import {
  getEquipmentAssignments,
  getPhoneLineAssignments,
} from "./assignments.actions";

export const useEquipmentAssignments = (params?: Record<string, any>) => {
  return useQuery<EquipmentAssignmentListResponse>({
    queryKey: ["equipmentAssignments", params],
    queryFn: () => getEquipmentAssignments(params),
    refetchOnWindowFocus: false,
  });
};

export const usePhoneLineAssignments = (params?: Record<string, any>) => {
  return useQuery<PhoneLineAssignmentListResponse>({
    queryKey: ["phoneLineAssignments", params],
    queryFn: () => getPhoneLineAssignments(params),
    refetchOnWindowFocus: false,
  });
};
