import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PER_DIEM_POLICY } from "./perDiemPolicy.constants";
import {
  getPerDiemPolicyProps,
  PerDiemPolicyResource,
  PerDiemPolicyResponse,
} from "./perDiemPolicy.interface";
import {
  PerDiemPolicySchema,
  PerDiemPolicySchemaUpdate,
} from "./perDiemPolicy.schema";

const { ENDPOINT } = PER_DIEM_POLICY;

export async function getPerDiemPolicy({
  params,
}: getPerDiemPolicyProps): Promise<PerDiemPolicyResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<PerDiemPolicyResponse>(ENDPOINT, config);
  return data;
}

export async function getAllPerDiemPolicy({
  params,
}: getPerDiemPolicyProps): Promise<PerDiemPolicyResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<PerDiemPolicyResource[]>(ENDPOINT, config);
  return data;
}

export async function findPerDiemPolicyById(
  id: number
): Promise<PerDiemPolicyResource> {
  const response = await api.get<PerDiemPolicyResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

function createPerDiemPolicyFormData(
  data: PerDiemPolicySchema | PerDiemPolicySchemaUpdate
): FormData {
  const formData = new FormData();

  if (data.version) formData.append("version", data.version);
  if (data.name) formData.append("name", data.name);
  if (data.effective_from)
    formData.append("effective_from", data.effective_from.toISOString());
  if (data.effective_to)
    formData.append("effective_to", data.effective_to.toISOString());

  formData.append("is_current", data.is_current ? "1" : "0");

  if (data.notes) formData.append("notes", data.notes);

  if (data.document instanceof File) {
    formData.append("document", data.document);
  }

  return formData;
}

export async function storePerDiemPolicy(
  data: PerDiemPolicySchema
): Promise<PerDiemPolicyResource> {
  const formData = createPerDiemPolicyFormData(data);

  const response = await api.post<PerDiemPolicyResource>(ENDPOINT, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

export async function updatePerDiemPolicy(
  id: number,
  data: PerDiemPolicySchemaUpdate
): Promise<PerDiemPolicyResource> {
  const formData = createPerDiemPolicyFormData(data);

  const response = await api.post<PerDiemPolicyResource>(
    `${ENDPOINT}/${id}?_method=PUT`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

export async function deletePerDiemPolicy(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
