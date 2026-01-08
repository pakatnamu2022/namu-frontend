import { api } from "@/core/api";
import type { AxiosRequestConfig } from "axios";
import {
  getIncomeSectorProps,
  IncomeSectorResource,
  IncomeSectorResponse,
} from "./incomeSector.interface";
import { STATUS_ACTIVE } from "@/core/core.constants";
import { INCOME_SECTOR } from "./incomeSector.constants";
import { AP_MASTER_TYPE } from "../../ap-master/lib/apMaster.constants";

const { ENDPOINT } = INCOME_SECTOR;

export async function getIncomeSector({
  params,
}: getIncomeSectorProps): Promise<IncomeSectorResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: AP_MASTER_TYPE.INCOME_SECTOR,
    },
  };
  const { data } = await api.get<IncomeSectorResponse>(ENDPOINT, config);
  return data;
}

export async function getAllIncomeSector({
  params,
}: getIncomeSectorProps): Promise<IncomeSectorResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: AP_MASTER_TYPE.INCOME_SECTOR,
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<IncomeSectorResource[]>(ENDPOINT, config);
  return data;
}

// export async function findIncomeSectorById(
//   id: number
// ): Promise<IncomeSectorResource> {
//   const response = await api.get<IncomeSectorResource>(`${ENDPOINT}/${id}`);
//   return response.data;
// }

// export async function storeIncomeSector(
//   data: any
// ): Promise<IncomeSectorResource> {
//   const response = await api.post<IncomeSectorResource>(ENDPOINT, data);
//   return response.data;
// }

// export async function updateIncomeSector(
//   id: number,
//   data: any
// ): Promise<IncomeSectorResource> {
//   const response = await api.put<IncomeSectorResource>(
//     `${ENDPOINT}/${id}`,
//     data
//   );
//   return response.data;
// }

// export async function deleteIncomeSector(id: number): Promise<GeneralResponse> {
//   const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
//   return data;
// }
