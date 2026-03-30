import { useQuery } from "@tanstack/react-query";
import {
  AppointmentPlanningResource,
  AppointmentPlanningResponse,
  getAppointmentPlanningProps,
} from "./appointmentPlanning.interface";
import {
  findAppointmentPlanningById,
  getAllAppointmentPlanning,
  getAppointmentPlanning,
} from "./appointmentPlanning.actions";
import { APPOINTMENT_PLANNING } from "./appointmentPlanning.constants";

const { QUERY_KEY } = APPOINTMENT_PLANNING;

export const useAppointmentPlanning = (props: getAppointmentPlanningProps) => {
  return useQuery<AppointmentPlanningResponse>({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getAppointmentPlanning(props),
    refetchOnWindowFocus: false,
    enabled: props.enabled !== false,
  });
};

export const useAllAppointmentPlanning = (params?: Record<string, any>) => {
  return useQuery<AppointmentPlanningResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllAppointmentPlanning({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAppointmentPlanningById = (id?: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAppointmentPlanningById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
