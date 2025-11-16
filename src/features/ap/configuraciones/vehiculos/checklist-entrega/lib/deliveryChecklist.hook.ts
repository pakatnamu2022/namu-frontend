import { useQuery } from "@tanstack/react-query";
import {
  findDeliveryChecklistById,
  getAllDeliveryChecklist,
  getDeliveryChecklist,
} from "./deliveryChecklist.actions";
import {
  DeliveryChecklistResource,
  DeliveryChecklistResponse,
} from "./deliveryChecklist.interface";
import { ITEM_DELIVERY } from "./deliveryChecklist.constants";

const { QUERY_KEY } = ITEM_DELIVERY;

export const useDeliveryChecklist = (params?: Record<string, any>) => {
  return useQuery<DeliveryChecklistResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getDeliveryChecklist({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllDeliveryChecklist = (params?: Record<string, any>) => {
  return useQuery<DeliveryChecklistResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllDeliveryChecklist({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useDeliveryChecklistById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findDeliveryChecklistById(id),
    refetchOnWindowFocus: false,
  });
};
