import { api } from "@/core/api.ts";
import type { AxiosRequestConfig } from "axios";
import {
  getSelectedWorkersProps,
  SelectedWorkerResource,
  SelectedWorkerResponse,
} from "./selectedWorker.interface.ts";
import { SELECTED_WORKER } from "./selectedWorker.constant.ts";

const { ENDPOINT } = SELECTED_WORKER;

export async function getSelectedWorkers({
  params,
}: getSelectedWorkersProps): Promise<SelectedWorkerResponse> {
  const config: AxiosRequestConfig = { params: { ...params } };
  const { data } = await api.get<SelectedWorkerResponse>(ENDPOINT, config);
  return data;
}

export async function uploadSignedOfferLetter(
  id: number,
  file: File,
): Promise<SelectedWorkerResource> {
  const fd = new FormData();
  fd.append("carta_oferta", file);
  const { data } = await api.post<SelectedWorkerResource>(
    `${ENDPOINT}/${id}/signed-letter`,
    fd,
  );
  return data;
}

export async function sendWorkerWelcomeEmail(
  id: number,
): Promise<SelectedWorkerResource> {
  const { data } = await api.post<SelectedWorkerResource>(
    `${ENDPOINT}/${id}/welcome-email`,
  );
  return data;
}

export async function generateWorkerUser(
  id: number,
): Promise<{ tipo: string; mensaje: string }> {
  const { data } = await api.post<{ tipo: string; mensaje: string }>(
    `${ENDPOINT}/${id}/generate-user`,
  );
  return data;
}

export async function changeWorkerLifeStatus(
  id: number,
  payload: { estado: number; fecha: string; motivo?: string },
): Promise<SelectedWorkerResource> {
  const { data } = await api.post<SelectedWorkerResource>(
    `${ENDPOINT}/${id}/life-status`,
    payload,
  );
  return data;
}

export async function rehireSelectedWorker(
  id: number,
  proceso_postulacion_id: number,
): Promise<SelectedWorkerResource> {
  const { data } = await api.post<SelectedWorkerResource>(
    `${ENDPOINT}/${id}/rehire`,
    { proceso_postulacion_id },
  );
  return data;
}
