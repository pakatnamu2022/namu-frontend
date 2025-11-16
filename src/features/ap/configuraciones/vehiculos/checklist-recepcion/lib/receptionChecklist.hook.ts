import { useQuery } from "@tanstack/react-query";
import {
  ReceptionChecklistResource,
  ReceptionChecklistResponse,
} from "./receptionChecklist.interface";
import {
  findReceptionChecklistById,
  getAllReceptionChecklist,
  getReceptionChecklist,
} from "./receptionChecklist.actions";
import { ITEM_RECEPTION } from "./receptionChecklist.constants";

const { QUERY_KEY } = ITEM_RECEPTION;

export const useReceptionChecklist = (params?: Record<string, any>) => {
  return useQuery<ReceptionChecklistResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getReceptionChecklist({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllReceptionChecklist = (params?: Record<string, any>) => {
  return useQuery<ReceptionChecklistResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllReceptionChecklist({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useReceptionChecklistById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findReceptionChecklistById(id),
    refetchOnWindowFocus: false,
  });
};
