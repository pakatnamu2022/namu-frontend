import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import { STATUS_ACTIVE } from "@/core/core.constants.ts";
import { AP_MASTER_TYPE } from "@/features/ap/ap-master/lib/apMaster.constants.ts";
import {
  getTypesOperationsAppointmentProps,
  TypesOperationsAppointmentResource,
  TypesOperationsAppointmentResponse,
} from "./typesOperationsAppointment.interface.ts";
import { TYPE_OPERACTION_APPOINTMENT } from "./typesOperationsAppointment.constants.ts";

const { ENDPOINT } = TYPE_OPERACTION_APPOINTMENT;

export async function getTypesOperationsAppointment({
  params,
}: getTypesOperationsAppointmentProps): Promise<TypesOperationsAppointmentResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: [AP_MASTER_TYPE.TYPE_OPERACTION_APPOINTMENT],
    },
  };
  const { data } = await api.get<TypesOperationsAppointmentResponse>(
    ENDPOINT,
    config
  );
  return data;
}

export async function getAllTypesOperationsAppointment({
  params,
}: getTypesOperationsAppointmentProps): Promise<
  TypesOperationsAppointmentResource[]
> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
      type: [AP_MASTER_TYPE.TYPE_OPERACTION_APPOINTMENT],
      status: STATUS_ACTIVE,
    },
  };
  const { data } = await api.get<TypesOperationsAppointmentResource[]>(
    ENDPOINT,
    config
  );
  return data;
}

export async function findTypesOperationsAppointmentById(
  id: number
): Promise<TypesOperationsAppointmentResource> {
  const response = await api.get<TypesOperationsAppointmentResource>(
    `${ENDPOINT}/${id}`
  );
  return response.data;
}

export async function storeTypesOperationsAppointment(
  data: any
): Promise<TypesOperationsAppointmentResource> {
  const response = await api.post<TypesOperationsAppointmentResource>(
    ENDPOINT,
    data
  );
  return response.data;
}

export async function updateTypesOperationsAppointment(
  id: number,
  data: any
): Promise<TypesOperationsAppointmentResource> {
  const response = await api.put<TypesOperationsAppointmentResource>(
    `${ENDPOINT}/${id}`,
    data
  );
  return response.data;
}

export async function deleteTypesOperationsAppointment(
  id: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
