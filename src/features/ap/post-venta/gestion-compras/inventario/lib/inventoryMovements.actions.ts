import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  getInventoryMovementProps,
  InventoryMovementResponse,
} from "./inventoryMovements.interface";

export const getInventoryMovements = async ({
  productId,
  warehouseId,
  params,
}: getInventoryMovementProps): Promise<InventoryMovementResponse> => {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<InventoryMovementResponse>(
    `/ap/postVenta/inventoryMovements/product/${productId}/warehouse/${warehouseId}/history`,
    config
  );
  return data;
};
