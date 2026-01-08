import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { DOCUMENT_TYPE } from "./documentTypes.constants";
import {
  DocumentTypeResource,
  DocumentTypeResponse,
  getDocumentTypeProps,
} from "./documentTypes.interface";
import { AP_MASTER_TYPE } from "../../../../comercial/ap-master/lib/apMaster.constants";

const { ENDPOINT } = DOCUMENT_TYPE;

export async function getDocumentType({
  params,
}: getDocumentTypeProps): Promise<DocumentTypeResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.DOCUMENT_TYPE,
    },
  };
  const { data } = await api.get<DocumentTypeResponse>(ENDPOINT, config);
  return data;
}

export async function getAllDocumentType({
  params,
}: getDocumentTypeProps): Promise<DocumentTypeResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_TYPE.DOCUMENT_TYPE,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<DocumentTypeResource[]>(ENDPOINT, config);
  return data;
}

export async function findDocumentTypeById(
  id: number
): Promise<DocumentTypeResource> {
  const response = await api.get<DocumentTypeResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function storeDocumentType(
  data: any
): Promise<DocumentTypeResource> {
  const response = await api.post<DocumentTypeResource>(ENDPOINT, data);
  return response.data;
}

export async function updateDocumentType(
  id: number,
  data: any
): Promise<DocumentTypeResource> {
  const response = await api.put<DocumentTypeResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteDocumentType(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
