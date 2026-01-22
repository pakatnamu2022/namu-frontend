import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { INVENTORY } from "./inventory.constants.ts";
import {
  getInventoryProps,
  InventoryResponse,
  StockByProductIdsResponse,
} from "./inventory.interface.ts";
import {
  getInventoryKardexProps,
  getInventoryMovementProps,
  InventoryMovementResponse,
} from "./inventoryMovements.interface.ts";

const { ENDPOINT } = INVENTORY;

export async function getInventory({
  params,
}: getInventoryProps): Promise<InventoryResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<InventoryResponse>(ENDPOINT, config);
  return data;
}

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

export const getInventoryKardex = async ({
  params,
}: getInventoryKardexProps): Promise<InventoryMovementResponse> => {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<InventoryMovementResponse>(
    `/ap/postVenta/inventoryMovements/kardex`,
    config
  );
  return data;
};

export async function createSaleFromQuotation(
  quotationId: number
): Promise<void> {
  await api.post(
    `/ap/postVenta/inventoryMovements/sales/quotation/${quotationId}`
  );
}

export async function getStockByProductIds(
  productIds: number[]
): Promise<StockByProductIdsResponse> {
  const { data } = await api.post<StockByProductIdsResponse>(
    `${ENDPOINT}/by-product-ids`,
    { product_ids: productIds }
  );
  return data;
}
