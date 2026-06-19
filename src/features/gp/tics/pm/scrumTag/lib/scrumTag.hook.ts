import { useQuery } from "@tanstack/react-query";
import { ScrumTagResource } from "./scrumTag.interface";
import { getScrumTags } from "./scrumTag.actions";

export const useScrumTags = (projectId?: number) => {
  return useQuery<ScrumTagResource[]>({
    queryKey: ["scrumTag", projectId],
    queryFn: () => getScrumTags(projectId),
    refetchOnWindowFocus: false,
  });
};
