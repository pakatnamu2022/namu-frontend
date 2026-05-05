import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import {
  getTransferReceptionsProps,
  TransferReceptionRequest,
  TransferReceptionResource,
  TransferReceptionResponse,
} from "./transferReception.interface.ts";
import { TRANSFER_RECEPTION } from "./transferReception.constants.ts";

const { ENDPOINT } = TRANSFER_RECEPTION;

export async function getTransferReceptions({
  params,
  productTransferId,
}: getTransferReceptionsProps): Promise<TransferReceptionResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      ...(productTransferId && { transfer_movement_id: productTransferId }),
    },
  };
  const { data } = await api.get<TransferReceptionResponse>(ENDPOINT, config);
  return data;
}

export async function getAllTransferReceptions({
  params,
  productTransferId,
}: getTransferReceptionsProps): Promise<TransferReceptionResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      ...(productTransferId && { transfer_movement_id: productTransferId }),
      all: true,
    },
  };
  const { data } = await api.get<TransferReceptionResource[]>(ENDPOINT, config);
  return data;
}

export async function getTransferReceptionById(
  id: number,
): Promise<TransferReceptionResource> {
  const { data } = await api.get<TransferReceptionResource>(
    `${ENDPOINT}/${id}`,
  );
  return data;
}

export async function findTransferReceptionById(
  id: number,
): Promise<TransferReceptionResource> {
  const response = await api.get<TransferReceptionResource>(
    `${ENDPOINT}/${id}`,
  );
  return response.data;
}

export async function storeTransferReception(
  payload: TransferReceptionRequest,
): Promise<TransferReceptionResource> {
  const { data } = await api.post<TransferReceptionResource>(ENDPOINT, payload);
  return data;
}

export async function deleteTransferReception(
  id: number,
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
