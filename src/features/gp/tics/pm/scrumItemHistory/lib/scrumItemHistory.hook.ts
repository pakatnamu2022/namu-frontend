import { useQuery } from "@tanstack/react-query";
import { ScrumItemHistoryResource } from "./scrumItemHistory.interface";
import { getScrumItemHistory } from "./scrumItemHistory.actions";

export const useScrumItemHistory = (itemId: number | null) => {
  return useQuery<ScrumItemHistoryResource[]>({
    queryKey: ["scrumItemHistory", itemId],
    queryFn: () => getScrumItemHistory(itemId!),
    enabled: itemId !== null,
    refetchOnWindowFocus: false,
  });
};
