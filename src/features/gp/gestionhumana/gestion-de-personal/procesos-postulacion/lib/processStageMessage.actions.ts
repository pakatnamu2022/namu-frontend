import { api } from "@/core/api.ts";
import {
  ProcessStageMessageResource,
  UpdateProcessStageMessagePayload,
} from "./processStageMessage.interface.ts";

const ENDPOINT = "/gp/gh/reclutamiento/process-stage-message";

export async function getProcessStageMessages(): Promise<
  ProcessStageMessageResource[]
> {
  const { data } = await api.get<ProcessStageMessageResource[]>(ENDPOINT);
  return data;
}

export async function updateProcessStageMessage(
  etapa: string,
  payload: UpdateProcessStageMessagePayload,
): Promise<ProcessStageMessageResource> {
  const { data } = await api.put<ProcessStageMessageResource>(
    `${ENDPOINT}/${etapa}`,
    payload,
  );
  return data;
}
