import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import {
  getInternalNoteMigrationProps,
  InternalNoteMigrationResource,
  InternalNoteMigrationResponse,
} from "./internalNoteMigration.interface";
import { INTERNAL_NOTE_MIGRATION } from "./internalNoteMigration.constants";

const { ENDPOINT } = INTERNAL_NOTE_MIGRATION;

export async function getInternalNoteMigration({
  params,
}: getInternalNoteMigrationProps): Promise<InternalNoteMigrationResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<InternalNoteMigrationResponse>(
    ENDPOINT,
    config,
  );
  return data;
}

export async function verifyInternalNoteMigration(
  id: number,
): Promise<InternalNoteMigrationResource> {
  const { data } = await api.post<InternalNoteMigrationResource>(
    `${ENDPOINT}/${id}/verify-internal-note-migration`,
  );
  return data;
}

export async function updateInternalNoteAccountingStatus(
  id: number,
): Promise<InternalNoteMigrationResource> {
  const { data } = await api.post<InternalNoteMigrationResource>(
    `${ENDPOINT}/${id}/update-internal-note-accounting-status`,
  );
  return data;
}
