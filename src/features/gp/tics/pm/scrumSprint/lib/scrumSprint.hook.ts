import { useQuery } from "@tanstack/react-query";
import { ScrumSprintResource } from "./scrumSprint.interface";
import { findScrumSprintById, getScrumSprints } from "./scrumSprint.actions";

export const useScrumSprints = (
  projectId?: number | null,
  params?: Record<string, any>
) => {
  return useQuery<ScrumSprintResource[]>({
    queryKey: ["scrumSprint", projectId ?? null, params],
    queryFn: () => getScrumSprints(projectId ?? null, params),
    refetchOnWindowFocus: false,
  });
};

export const useScrumSprintById = (id: number | null) => {
  return useQuery<ScrumSprintResource>({
    queryKey: ["scrumSprint", id],
    queryFn: () => findScrumSprintById(id!),
    enabled: id !== null,
    refetchOnWindowFocus: false,
  });
};
