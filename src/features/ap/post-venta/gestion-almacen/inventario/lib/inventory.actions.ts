import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { INVENTORY } from "./inventory.constants.ts";
import {
  getInventoryProps,
  InventoryResponse,
  StockByProductIdsResponse,
  CompareDynamicsResponse,
  InventoryResource,
  PriceCalculationDetailsResponse,
  StockMovementHistoryResponse,
  getReservedStockReportProps,
  ReservedStockReportResponse,
} from "./inventory.interface.ts";
import {
  getInventoryKardexProps,
  getInventoryMovementProps,
  getProductPurchaseHistoryProps,
  InventoryKardexResponse,
  InventoryMovementResource,
  InventoryMovementShowResponse,
  PurchaseHistoryResponse,
} from "./inventoryMovements.interface.ts";
import { InventoryMovementListResponse } from "./inventoryMovementsList.interface.ts";
import { InventoryStockMinMaxSchema } from "./inventoryStockMinMaxSchema.ts";

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
}: getInventoryMovementProps): Promise<InventoryMovementListResponse> => {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<InventoryMovementListResponse>(
    `/ap/postVenta/inventoryMovements/product/${productId}/warehouse/${warehouseId}/history`,
    config,
  );
  return data;
};

export const getInventoryMovementById = async (
  id: number,
): Promise<InventoryMovementShowResponse> => {
  const { data } = await api.get<
    InventoryMovementShowResponse | InventoryMovementResource
  >(`/ap/postVenta/inventoryMovements/${id}`);
  // El endpoint show devuelve el movimiento plano; lo normalizamos a { data }
  // para respetar el contrato InventoryMovementShowResponse que consume el hook.
  return "data" in data
    ? (data as InventoryMovementShowResponse)
    : { data: data as InventoryMovementResource };
};

export const getInventoryKardex = async ({
  params,
}: getInventoryKardexProps): Promise<InventoryKardexResponse> => {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<InventoryKardexResponse>(
    `/ap/postVenta/inventoryMovements/kardex`,
    config,
  );
  return data;
};

export const exportInventoryKardex = async (
  params: Record<string, any>,
): Promise<void> => {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
    responseType: "blob",
  };

  const response = await api.get(
    `/ap/postVenta/inventoryMovements/kardex/export`,
    config,
  );

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const contentDisposition = response.headers["content-disposition"];
  let filename = `kardex-inventario.xlsx`;
  if (contentDisposition) {
    const match = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
    );
    if (match?.[1]) filename = match[1].replace(/['"]/g, "");
  }

  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export async function createSaleFromQuotation(
  quotationId: number,
): Promise<void> {
  await api.post(
    `/ap/postVenta/inventoryMovements/sales/quotation/${quotationId}`,
  );
}

export async function getStockByProductIds(
  productIds: number[],
): Promise<StockByProductIdsResponse> {
  const { data } = await api.post<StockByProductIdsResponse>(
    `${ENDPOINT}/by-product-ids`,
    { product_ids: productIds },
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
    config,
  );
  return data;
};

export const exportProductPurchaseHistory = async (
  productId: number,
  warehouseId: number,
  params?: {
    date_from?: string;
    date_to?: string;
  },
): Promise<void> => {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
    responseType: "blob",
  };

  const response = await api.get(
    `/ap/postVenta/inventoryMovements/product/${productId}/warehouse/${warehouseId}/purchase-history/export`,
    config,
  );

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `historico-compras-${productId}-${warehouseId}.xlsx`,
  );

  document.body.appendChild(link);
  link.click();

  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const exportInventory = async (params: {
  warehouse_id: number;
  stock_type?: "all" | "with_stock" | "without_stock";
  title?: string;
}): Promise<void> => {
  const config: AxiosRequestConfig = {
    params,
    responseType: "blob",
  };

  const response = await api.get(
    `/ap/postVenta/productWarehouseStock/export/inventory`,
    config,
  );

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const contentDisposition = response.headers["content-disposition"];
  let filename = `inventario-almacen-${params.warehouse_id}.xlsx`;
  if (contentDisposition) {
    const match = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
    );
    if (match?.[1]) filename = match[1].replace(/['"]/g, "");
  }

  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getCompareDynamics = async (params: {
  warehouse_id: number;
}): Promise<CompareDynamicsResponse> => {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<CompareDynamicsResponse>(
    `/ap/postVenta/productWarehouseStock/compare-dynamics`,
    config,
  );
  return data;
};

export const exportProductMovementHistory = async (
  productId: number,
  warehouseId: number,
  params?: {
    date_from?: string;
    date_to?: string;
  },
): Promise<void> => {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
    responseType: "blob",
  };

  const response = await api.get(
    `/ap/postVenta/inventoryMovements/product/${productId}/warehouse/${warehouseId}/history/export`,
    config,
  );

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute(
    "download",
    `movimientos-producto-${productId}-${warehouseId}.xlsx`,
  );

  document.body.appendChild(link);
  link.click();

  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const getPriceCalculationDetails = async (
  productId: number,
  warehouseId: number,
): Promise<PriceCalculationDetailsResponse> => {
  const { data } = await api.get<PriceCalculationDetailsResponse>(
    `/ap/postVenta/productWarehouseStock/price-calculation-details`,
    { params: { product_id: productId, warehouse_id: warehouseId } },
  );
  return data;
};

export const getStockMovementHistory = async (
  productId: number,
  warehouseId: number,
): Promise<StockMovementHistoryResponse> => {
  const { data } = await api.get<StockMovementHistoryResponse>(
    `/ap/postVenta/productWarehouseStock/movement-history`,
    { params: { product_id: productId, warehouse_id: warehouseId } },
  );
  return data;
};

export async function updateInventoryStockMinMax(
  id: number,
  data: InventoryStockMinMaxSchema,
): Promise<InventoryResource> {
  const response = await api.put(
    `/ap/postVenta/productWarehouseStock/${id}`,
    data,
  );
  return response.data;
}

export async function rebuildCostHistory(
  productId: number,
  warehouseId: number,
): Promise<void> {
  await api.post(`/ap/postVenta/productWarehouseStock/rebuild-cost-history`, {
    product_id: productId,
    warehouse_id: warehouseId,
  });
}

export const getReservedStockReport = async (
  params?: getReservedStockReportProps,
): Promise<ReservedStockReportResponse> => {
  const { data } = await api.get<ReservedStockReportResponse>(
    `/ap/postVenta/productWarehouseStock/reserved-stock-report`,
    { params },
  );
  return data;
};

/**
 * Re-reserva el stock de una orden de trabajo o de una cotización después de
 * haber emitido una nota de crédito. Se debe enviar exactamente UNO de los dos:
 * `work_order_id` o `quotation_id`.
 */
export async function reReserveStockAfterCreditNote(payload: {
  work_order_id?: number;
  quotation_id?: number;
}): Promise<void> {
  await api.post(
    `/ap/postVenta/productWarehouseStock/re-reserve-after-credit-note`,
    payload,
  );
}
