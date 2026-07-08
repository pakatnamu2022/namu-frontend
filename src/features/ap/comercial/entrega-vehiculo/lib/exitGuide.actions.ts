import { api } from "@/core/api";
import { VehicleResource } from "../../vehiculos/lib/vehicles.interface";
import { VehiclesDeliveryResource } from "./vehicleDelivery.interface";
import { VEHICLE_DELIVERY } from "./vehicleDelivery.constants";

const { ENDPOINT } = VEHICLE_DELIVERY;

export async function getStockInicialAvailableVehicles(
  params?: Record<string, any>,
): Promise<VehicleResource[]> {
  const { data } = await api.get<VehicleResource[]>(
    `${ENDPOINT}/stock-inicial/available-vehicles`,
    { params },
  );
  return data;
}

export async function storeStockInicialDelivery(
  data: any,
): Promise<VehiclesDeliveryResource> {
  const response = await api.post<VehiclesDeliveryResource>(
    `${ENDPOINT}/stock-inicial`,
    data,
  );
  return response.data;
}
