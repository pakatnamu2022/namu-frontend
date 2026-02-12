import { useQuery } from "@tanstack/react-query";
import {
  findAccountantDistrictAssignmentById,
  getAllAccountantDistrictAssignment,
  getAccountantDistrictAssignment,
} from "./accountantDistrictAssignment.actions";
import { ACCOUNTANT_DISTRICT_ASSIGNMENT } from "./accountantDistrictAssignment.constants";
import { getAccountantDistrictAssignmentProps } from "./accountantDistrictAssignment.interface";

const { QUERY_KEY } = ACCOUNTANT_DISTRICT_ASSIGNMENT;

export function useGetAccountantDistrictAssignment(
  props: getAccountantDistrictAssignmentProps
) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getAccountantDistrictAssignment(props),
  });
}

export function useGetAllAccountantDistrictAssignment(
  params?: Record<string, any>
) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllAccountantDistrictAssignment({ params }),
  });
}

export function useFindAccountantDistrictAssignmentById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findAccountantDistrictAssignmentById(id),
    enabled: !!id,
  });
}
