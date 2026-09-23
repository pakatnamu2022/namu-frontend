import { useQuery } from "@tanstack/react-query";
import {
  ScrumItemDetail,
  ScrumItemResource,
  ScrumItemResponse,
  ScrumKanbanResponse,
} from "./scrumItem.interface";
import {
  findScrumItemById,
  getScrumBacklog,
  getScrumItems,
  getScrumKanban,
} from "./scrumItem.actions";

export const useScrumKanban = (params: Record<string, any> | null) => {
  return useQuery<ScrumKanbanResponse>({
    queryKey: ["scrumKanban", params],
    queryFn: () => getScrumKanban(params ?? undefined),
    enabled: params !== null,
  });
};

export const useScrumBacklog = (projectId: number | null) => {
  return useQuery<ScrumItemResource[]>({
    queryKey: ["scrumBacklog", projectId],
    queryFn: () => getScrumBacklog(projectId!),
    enabled: projectId !== null,
  });
};

export const useScrumItems = (params?: Record<string, any>, enabled = true) => {
  return useQuery<ScrumItemResponse>({
    queryKey: ["scrumItem", params],
    queryFn: () => getScrumItems(params),
    enabled,
  });
};

export const useScrumItemById = (id: number | null) => {
  return useQuery<ScrumItemDetail>({
    queryKey: ["scrumItem", id],
    queryFn: () => findScrumItemById(id!),
    enabled: id !== null,
  });
};
