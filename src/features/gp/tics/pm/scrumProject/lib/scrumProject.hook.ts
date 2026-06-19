import { useQuery } from "@tanstack/react-query";
import { ScrumProjectResource, ScrumProjectResponse } from "./scrumProject.interface";
import { findScrumProjectById, getScrumProjects } from "./scrumProject.actions";

export const useScrumProjects = (params?: Record<string, any>) => {
  return useQuery<ScrumProjectResponse>({
    queryKey: ["scrumProject", params],
    queryFn: () => getScrumProjects(params),
    refetchOnWindowFocus: false,
  });
};

export const useScrumProjectById = (id: number | null) => {
  return useQuery<ScrumProjectResource>({
    queryKey: ["scrumProject", id],
    queryFn: () => findScrumProjectById(id!),
    enabled: id !== null,
    refetchOnWindowFocus: false,
  });
};
