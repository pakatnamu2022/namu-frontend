import { useQuery } from "@tanstack/react-query";
import { EquipmentResponse } from "@/src/features/gp/tics/equipment/lib/equipment.interface";
import { getEquipment } from "@/src/features/gp/tics/equipment/lib/equipment.actions";

export const useEquipments = (params?: Record<string, any>) => {
  return useQuery<EquipmentResponse>({
    queryKey: ["equipment", params],
    queryFn: () => getEquipment({ params }),
    refetchOnWindowFocus: false,
  });
};
