import { useQuery } from "@tanstack/react-query";
import { ProcessStageMessageResource } from "./processStageMessage.interface.ts";
import { getProcessStageMessages } from "./processStageMessage.actions.ts";

export const useProcessStageMessages = () => {
  return useQuery<ProcessStageMessageResource[]>({
    queryKey: ["processStageMessage"],
    queryFn: getProcessStageMessages,
    refetchOnWindowFocus: false,
  });
};
