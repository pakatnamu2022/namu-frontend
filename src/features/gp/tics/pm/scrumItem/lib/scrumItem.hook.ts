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

export const useScrumKanban = (sprintId: number | null) => {
  return useQuery<ScrumKanbanResponse>({
    queryKey: ["scrumKanban", sprintId],
    queryFn: () => getScrumKanban(sprintId!),
    enabled: sprintId !== null,
  });
};

export const useScrumBacklog = (projectId: number | null) => {
  return useQuery<ScrumItemResource[]>({
    queryKey: ["scrumBacklog", projectId],
    queryFn: () => getScrumBacklog(projectId!),
    enabled: projectId !== null,
  });
};

export const useScrumItems = (params?: Record<string, any>) => {
  return useQuery<ScrumItemResponse>({
    queryKey: ["scrumItem", params],
    queryFn: () => getScrumItems(params),
  });
};

export const useScrumItemById = (id: number | null) => {
  return useQuery<ScrumItemDetail>({
    queryKey: ["scrumItem", id],
    queryFn: () => findScrumItemById(id!),
    enabled: id !== null,
  });
};
