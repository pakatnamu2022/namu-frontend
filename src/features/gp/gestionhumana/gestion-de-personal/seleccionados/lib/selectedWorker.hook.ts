import { useQuery } from "@tanstack/react-query";
import { SelectedWorkerResponse } from "./selectedWorker.interface.ts";
import { getSelectedWorkers } from "./selectedWorker.actions.ts";
import { SELECTED_WORKER } from "./selectedWorker.constant.ts";

const { QUERY_KEY } = SELECTED_WORKER;

export const useSelectedWorkers = (params?: Record<string, any>) => {
  return useQuery<SelectedWorkerResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getSelectedWorkers({ params }),
    refetchOnWindowFocus: false,
  });
};
