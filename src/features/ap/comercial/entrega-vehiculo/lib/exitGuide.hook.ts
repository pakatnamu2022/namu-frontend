import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import {
  getStockInicialAvailableVehicles,
  storeStockInicialDelivery,
} from "./exitGuide.actions";
import { VEHICLE_DELIVERY } from "./vehicleDelivery.constants";

const { QUERY_KEY } = VEHICLE_DELIVERY;

export const useStockInicialAvailableVehicles = (sedeId?: number) => {
  return useQuery<VehicleResource[]>({
    queryKey: [QUERY_KEY, "stock-inicial-available-vehicles", sedeId],
    queryFn: () => getStockInicialAvailableVehicles({ sede_id: sedeId }),
    enabled: !!sedeId,
    refetchOnWindowFocus: false,
  });
};

export const useStoreStockInicialDelivery = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: storeStockInicialDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
