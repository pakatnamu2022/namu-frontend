import { useQuery } from "@tanstack/react-query";
import { ScrumCommentResource } from "./scrumComment.interface";
import { getScrumComments } from "./scrumComment.actions";

export const useScrumComments = (itemId: number | null) => {
  return useQuery<ScrumCommentResource[]>({
    queryKey: ["scrumComment", itemId],
    queryFn: () => getScrumComments(itemId!),
    enabled: itemId !== null,
    refetchOnWindowFocus: false,
  });
};
