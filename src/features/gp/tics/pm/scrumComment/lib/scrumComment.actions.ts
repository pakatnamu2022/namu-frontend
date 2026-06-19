import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  ScrumCommentRequest,
  ScrumCommentResource,
} from "./scrumComment.interface";

const ENDPOINT = "/gp/tics/pm/scrumComment";

export async function getScrumComments(
  itemId: number
): Promise<ScrumCommentResource[]> {
  const { data } = await api.get<ScrumCommentResource[]>(ENDPOINT, {
    params: { item_id: itemId },
  });
  return data;
}

export async function storeScrumComment(
  payload: ScrumCommentRequest
): Promise<ScrumCommentResource> {
  const { data } = await api.post<ScrumCommentResource>(ENDPOINT, payload);
  return data;
}

export async function updateScrumComment(
  id: number,
  content: string
): Promise<ScrumCommentResource> {
  const { data } = await api.put<ScrumCommentResource>(`${ENDPOINT}/${id}`, {
    content,
  });
  return data;
}

export async function deleteScrumComment(id: number): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
  return data;
}
