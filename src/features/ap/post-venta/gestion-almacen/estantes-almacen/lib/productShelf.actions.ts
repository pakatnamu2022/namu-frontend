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
  UpdateShelfProductPositionRequest,
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

export async function updateShelfProductPosition(
  payload: UpdateShelfProductPositionRequest,
): Promise<GeneralResponse> {
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/update-position`,
    payload,
  );
  return data;
}

export async function exportProductShelf(
  shelfId: number,
  code?: string,
): Promise<void> {
  let response;
  try {
    response = await api.get(`${ENDPOINT}/${shelfId}/export`, {
      responseType: "blob",
    });
  } catch (error: any) {
    const blobData = error?.response?.data;
    if (blobData instanceof Blob) {
      const text = await blobData.text();
      try {
        const parsed = JSON.parse(text);
        error.response.data = parsed;
        error.message = parsed?.error || parsed?.message || error.message;
      } catch {
        // el body no era JSON, se deja el error original
      }
    }
    throw error;
  }

  const blob = new Blob([response.data], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const contentDisposition = response.headers["content-disposition"];
  let filename = `estante-${code ?? shelfId}.xlsx`;
  if (contentDisposition) {
    const match = contentDisposition.match(
      /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/,
    );
    if (match?.[1]) {
      filename = match[1].replace(/['"]/g, "").trim();
    }
  }
  link.setAttribute("download", filename);

  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}
