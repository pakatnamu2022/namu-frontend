import { useQuery } from "@tanstack/react-query";
import {
  EquipmentResponse,
  EquipmentAssignmentResource,
} from "@/features/gp/tics/equipment/lib/equipment.interface";
import {
  getEquipment,
  getEquipmentHistory,
} from "@/features/gp/tics/equipment/lib/equipment.actions";

export const useEquipments = (params?: Record<string, any>) => {
  return useQuery<EquipmentResponse>({
    queryKey: ["equipment", params],
    queryFn: () => getEquipment({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useEquipmentHistory = (equipoId: number | null) => {
  return useQuery<EquipmentAssignmentResource[]>({
    queryKey: ["equipmentHistory", equipoId],
    queryFn: () => getEquipmentHistory(equipoId!),
    enabled: equipoId !== null,
    refetchOnWindowFocus: false,
  });
};
