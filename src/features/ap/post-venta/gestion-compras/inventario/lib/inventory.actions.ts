import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { INVENTORY } from "./inventory.constants.ts";
import {
  getInventoryProps,
  InventoryResource,
  InventoryResponse,
} from "./inventory.interface.ts";

const { ENDPOINT } = INVENTORY;

export async function getInventory({
  params,
}: getInventoryProps): Promise<InventoryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<InventoryResponse>(
    `${ENDPOINT}/warehouse-stock-with-transit`,
    config
  );
  return data;
}

export async function getAllInventory({
  params,
}: getInventoryProps): Promise<InventoryResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
    },
  };
  const { data } = await api.get<InventoryResource[]>(
    `${ENDPOINT}/warehouse-stock-with-transit`,
    config
  );
  return data;
}
