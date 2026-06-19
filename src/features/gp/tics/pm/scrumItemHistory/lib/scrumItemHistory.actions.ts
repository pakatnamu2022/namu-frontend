import { api } from "@/core/api";
import { ScrumItemHistoryResource } from "./scrumItemHistory.interface";

const ENDPOINT = "/gp/tics/pm/scrumItemHistory";

export async function getScrumItemHistory(
  itemId: number
): Promise<ScrumItemHistoryResource[]> {
  const { data } = await api.get<ScrumItemHistoryResource[]>(ENDPOINT, {
    params: { item_id: itemId },
  });
  return data;
}
