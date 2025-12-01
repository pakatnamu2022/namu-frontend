import { useQuery } from "@tanstack/react-query";
import { TYPE_OPERACTION_APPOINTMENT } from "./typesOperationsAppointment.constants.ts";
import {
  TypesOperationsAppointmentResource,
  TypesOperationsAppointmentResponse,
} from "./typesOperationsAppointment.interface.ts";
import {
  findTypesOperationsAppointmentById,
  getAllTypesOperationsAppointment,
  getTypesOperationsAppointment,
} from "./typesOperationsAppointment.actions.ts";

const { QUERY_KEY } = TYPE_OPERACTION_APPOINTMENT;

export const useTypesOperationsAppointment = (params?: Record<string, any>) => {
  return useQuery<TypesOperationsAppointmentResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getTypesOperationsAppointment({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTypesOperationsAppointment = (
  params?: Record<string, any>
) => {
  return useQuery<TypesOperationsAppointmentResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllTypesOperationsAppointment({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useTypesOperationsAppointmentById = (id?: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findTypesOperationsAppointmentById(id!),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
