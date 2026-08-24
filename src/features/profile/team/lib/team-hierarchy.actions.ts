import { api } from "@/core/api";
import { WorkerHierarchyNode } from "./team-hierarchy.interface";

export async function getWorkerSubordinates(
  id: number,
): Promise<WorkerHierarchyNode[]> {
  const { data } = await api.get<WorkerHierarchyNode[]>(
    `/gp/gh/personal/worker/${id}/subordinates`,
  );
  return data;
}
