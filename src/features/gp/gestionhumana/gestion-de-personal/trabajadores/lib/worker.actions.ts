import { api } from "@/core/api.ts";
import { GeneralResponse } from "@/shared/lib/response.interface.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getWorkerProps,
  getWorkersProps,
  PersonBirthdayResponse,
  WorkerContractsSummary,
  WorkerResource,
  WorkerResponse,
  WorkerVacationResource,
} from "./worker.interface.ts";
import { WORKER } from "./worker.constant.ts";
import { type UserCompleteResource } from "@/features/gp/gestionsistema/usuarios/lib/user.interface.ts";

const { ENDPOINT } = WORKER;
const VACATION_ENDPOINT = "/gp/gh/personal/vacation";
const SALARY_INCREASE_ENDPOINT = "/gp/gh/personal/salary-increases";

export async function getBirthdays(): Promise<PersonBirthdayResponse> {
  const config: AxiosRequestConfig = {
    params: {
      per_page: 5,
    },
  };
  const { data } = await api.get<PersonBirthdayResponse>(
    `${ENDPOINT}/birthdays`,
    config,
  );
  return data;
}

export async function getWorker({
  params,
}: getWorkersProps): Promise<WorkerResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
    },
  };
  const { data } = await api.get<WorkerResponse>(ENDPOINT, config);
  return data;
}

export async function getAllWorkers({
  params,
}: getWorkersProps): Promise<WorkerResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<WorkerResource[]>(ENDPOINT, config);
  return data;
}

export async function getMyConsultants({
  params,
}: getWorkersProps): Promise<WorkerResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true, // Assuming you want to fetch all periods
      ...params,
    },
  };
  const { data } = await api.get<WorkerResource[]>(
    `${ENDPOINT}/my-consultants`,
    config,
  );
  return data;
}

export async function findWorkerById(
  id: number,
  params?: getWorkerProps,
): Promise<WorkerResource> {
  const response = await api.get<WorkerResource>(`${ENDPOINT}/${id}`, {
    params,
  });
  return response.data;
}

/** Ficha completa (misma forma que el perfil de usuario) de un trabajador. */
export async function getWorkerComplete(
  id: number,
): Promise<UserCompleteResource> {
  const { data } = await api.get<UserCompleteResource>(
    `${ENDPOINT}/${id}/complete`,
  );
  return data;
}

/** Contratos del trabajador + evolución de su sueldo. */
export async function getWorkerContractsSummary(
  id: number,
): Promise<WorkerContractsSummary> {
  const { data } = await api.get<WorkerContractsSummary>(
    `${ENDPOINT}/${id}/contracts-summary`,
  );
  return data;
}

export interface StoreSalaryIncreaseBody {
  worker_id: number;
  new_salary: number;
  effective_date: string;
  previous_salary?: number;
  reason?: string;
}

/** Registra un aumento de sueldo (solo trabajadores con contrato indeterminado). */
export async function storeSalaryIncrease(
  body: StoreSalaryIncreaseBody,
): Promise<unknown> {
  const { data } = await api.post(SALARY_INCREASE_ENDPOINT, body);
  return data;
}

export async function getWorkerVacations(
  workerId: number,
): Promise<WorkerVacationResource[]> {
  const { data } = await api.get<WorkerVacationResource[]>(VACATION_ENDPOINT, {
    params: {
      empleado_id: workerId,
      all: true,
      sort: "fecha_inicio",
      direction: "desc",
    },
  });
  return data;
}

export async function storeWorker(data: any): Promise<WorkerResponse> {
  const response = await api.post<WorkerResponse>(ENDPOINT, data);
  return response.data;
}

export async function updateWorker(
  id: string,
  data: any,
): Promise<WorkerResponse> {
  const response = await api.put<WorkerResponse>(`${ENDPOINT}/${id}`, data);
  return response.data;
}

export async function deleteWorker(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}

export async function getWorkersWithoutObjectives(): Promise<WorkerResource[]> {
  const { data } = await api.get<{ data: WorkerResource[] }>(
    `${ENDPOINT}-without-objectives`,
  );
  return data.data;
}

export async function getWorkersWithoutCategories(): Promise<WorkerResource[]> {
  const { data } = await api.get<{ data: WorkerResource[] }>(
    `${ENDPOINT}-without-categories`,
  );
  return data.data;
}

export async function getWorkersWithoutCompetences(): Promise<
  WorkerResource[]
> {
  const { data } = await api.get<{ data: WorkerResource[] }>(
    `${ENDPOINT}-without-competences`,
  );
  return data.data;
}
