import { useQuery } from "@tanstack/react-query";
import {
  CampaignScheduleResource,
  CampaignScheduleResponse,
  getCampaignScheduleProps,
  WorkerScheduleResponse,
  GetWorkerScheduleParams,
} from "./campaignSchedule.interface";
import {
  findCampaignScheduleById,
  getCampaignSchedule,
  getWorkerSchedule,
} from "./campaignSchedule.actions";
import { CAMPAIGN_SCHEDULE } from "./campaignSchedule.constants";

const { QUERY_KEY } = CAMPAIGN_SCHEDULE;

export const useCampaignSchedule = (props: getCampaignScheduleProps) => {
  return useQuery<CampaignScheduleResponse>({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getCampaignSchedule(props),
    refetchOnWindowFocus: false,
    enabled: props.enabled !== false,
  });
};

export const useCampaignScheduleById = (id?: number) => {
  return useQuery<CampaignScheduleResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findCampaignScheduleById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};

export const useWorkerSchedule = (
  params: GetWorkerScheduleParams,
  enabled: boolean = true,
) => {
  return useQuery<WorkerScheduleResponse>({
    queryKey: [QUERY_KEY, "worker-schedule", params],
    queryFn: () => getWorkerSchedule(params),
    refetchOnWindowFocus: false,
    enabled: enabled && !!params.worker_id,
  });
};
