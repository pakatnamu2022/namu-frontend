import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { PRODUCT_SHELF } from "./productShelf.constants.ts";
import {
  AssignShelfProductsRequest,
  getProductShelfProps,
  ProductShelfRequest,
  ProductShelfResource,
  ProductShelfResponse,
  RemoveShelfProductRequest,
  ShelfProductItem,
} from "./productShelf.interface.ts";

const { ENDPOINT } = PRODUCT_SHELF;

export async function getProductShelves({
  params,
}: getProductShelfProps): Promise<ProductShelfResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<ProductShelfResponse>(ENDPOINT, config);
  return data;
}

export async function getAllProductShelves({
  params,
}: getProductShelfProps): Promise<ProductShelfResource[]> {
  const config: AxiosRequestConfig = {
    params: { all: true, ...params },
  };
  const { data } = await api.get<ProductShelfResource[]>(ENDPOINT, config);
  return data;
}

export async function findProductShelfById(
  id: number,
): Promise<ProductShelfResource> {
  const { data } = await api.get<ProductShelfResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function storeProductShelf(
  payload: ProductShelfRequest,
): Promise<ProductShelfResource> {
  const { data } = await api.post<ProductShelfResource>(ENDPOINT, payload);
  return data;
}

export async function updateProductShelf(
  id: number,
  payload: Partial<ProductShelfRequest>,
): Promise<ProductShelfResource> {
  const { data } = await api.put<ProductShelfResource>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteProductShelf(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

// ─── Gestión de productos del estante ────────────────────────────────────────

export async function getShelfProducts(
  shelfId: number,
): Promise<ShelfProductItem[]> {
  const { data } = await api.get<ShelfProductItem[]>(
    `${ENDPOINT}/${shelfId}/products`,
  );
  return data;
}

export async function assignShelfProducts(
  payload: AssignShelfProductsRequest,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/assign-products`,
    payload,
  );
  return data;
}

export async function removeShelfProduct(
  payload: RemoveShelfProductRequest,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/remove-product`,
    payload,
  );
  return data;
}
