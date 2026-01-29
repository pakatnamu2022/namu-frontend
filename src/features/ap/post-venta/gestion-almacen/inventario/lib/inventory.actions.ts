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
  getProductPurchaseHistoryProps,
  InventoryMovementResponse,
  PurchaseHistoryResponse,
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

export const getProductPurchaseHistory = async ({
  productId,
  warehouseId,
  params,
}: getProductPurchaseHistoryProps): Promise<PurchaseHistoryResponse> => {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<PurchaseHistoryResponse>(
    `/ap/postVenta/inventoryMovements/product/${productId}/warehouse/${warehouseId}/purchase-history`,
    config
  );
  return data;
};

export const exportProductPurchaseHistory = async (
  productId: number,
  warehouseId: number,
  params?: {
    date_from?: string;
    date_to?: string;
  }
): Promise<void> => {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
    responseType: "blob",
  };

  const response = await api.get(
    `/ap/postVenta/inventoryMovements/product/${productId}/warehouse/${warehouseId}/purchase-history/export`,
    config
  );

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `historico-compras-${productId}-${warehouseId}.xlsx`
  );

  document.body.appendChild(link);
  link.click();

  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportProductMovementHistory = async (
  productId: number,
  warehouseId: number,
  params?: {
    date_from?: string;
    date_to?: string;
  }
): Promise<void> => {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
    responseType: "blob",
  };

  const response = await api.get(
    `/ap/postVenta/inventoryMovements/product/${productId}/warehouse/${warehouseId}/history/export`,
    config
  );

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `movimientos-producto-${productId}-${warehouseId}.xlsx`
  );

  document.body.appendChild(link);
  link.click();

  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};
