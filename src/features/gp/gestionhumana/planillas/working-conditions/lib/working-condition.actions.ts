import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import type { AxiosRequestConfig } from "axios";
import {
  WorkingConditionResource,
  WorkingConditionResponse,
} from "./working-condition.interface";
import { WORKING_CONDITION } from "./working-condition.constant";

const { ENDPOINT } = WORKING_CONDITION;

export async function getWorkingConditions(
  params?: Record<string, any>,
): Promise<WorkingConditionResponse> {
  const config: AxiosRequestConfig = { params };
  const { data } = await api.get<WorkingConditionResponse>(ENDPOINT, config);
  return data;
}

export async function findWorkingConditionById(
  id: number,
): Promise<WorkingConditionResource> {
  const { data } = await api.get<{ data: WorkingConditionResource }>(
    `${ENDPOINT}/${id}`,
  );
  return data.data;
}

/**
 * GET /working-conditions/template?company_id=
 * Descarga la plantilla Excel (cabecera azul) pre-llenada con los trabajadores activos de la
 * empresa, para completar el monto de C.T. e importarla luego con importWorkingConditions().
 */
export async function downloadWorkingConditionsTemplate(
  companyId: string | number,
): Promise<void> {
  const { data } = await api.get(`${ENDPOINT}/template`, {
    params: { company_id: companyId },
    responseType: "blob",
  });
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "plantilla_condiciones_trabajo.xlsx";
  a.click();
  URL.revokeObjectURL(url);
}

export async function updateWorkingCondition(
  id: number,
  body: Partial<Pick<WorkingConditionResource, "amount" | "status">>,
): Promise<WorkingConditionResource> {
  const { data } = await api.put(`${ENDPOINT}/${id}`, body);
  return data;
}

export async function importWorkingConditions(
  file: File,
  period_id: string | number,
): Promise<GeneralResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("period_id", String(period_id));
  const { data } = await api.post<GeneralResponse>(
    `${ENDPOINT}/import`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}
