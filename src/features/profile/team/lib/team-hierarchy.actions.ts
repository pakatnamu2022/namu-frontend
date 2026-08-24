import { api } from "@/core/api";
import {
  WorkerHierarchyNode,
  WorkerHierarchySearchResult,
} from "./team-hierarchy.interface";

export async function getWorkerSubordinates(
  id: number,
): Promise<WorkerHierarchyNode[]> {
  const { data } = await api.get<WorkerHierarchyNode[]>(
    `/gp/gh/personal/worker/${id}/subordinates`,
  );
  return data;
}

export async function searchWorkerHierarchy(
  rootId: number,
  query: string,
): Promise<WorkerHierarchySearchResult[]> {
  const { data } = await api.get<WorkerHierarchySearchResult[]>(
    `/gp/gh/personal/worker/${rootId}/search-hierarchy`,
    { params: { q: query } },
  );
  return data;
}
