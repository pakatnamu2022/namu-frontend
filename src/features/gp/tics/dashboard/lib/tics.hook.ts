import { useQuery } from "@tanstack/react-query";
import { getSedeGraph, getUseStateGraph } from "./tics.actions";
import { UseStateGraphResource } from "./tics.interface";

export const useEquipmentsEstadoUso = () => {
  return useQuery<UseStateGraphResource[]>({
    queryKey: ["equipments", "estado-uso"],
    queryFn: () => getUseStateGraph(),
    refetchOnWindowFocus: false,
  });
};

export function useEquipmentsBySede() {
  return useQuery({
    queryKey: ["equipments", "porSede"],
    queryFn: () => getSedeGraph(),
    refetchOnWindowFocus: false,
  });
}
