import { useQuery } from "@tanstack/react-query";
import { ESTABLISHMENTS } from "./establishments.constants";
import {
  EstablishmentsResource,
  EstablishmentsResponse,
} from "./establishments.interface";
import {
  findEstablishmentsById,
  getAllEstablishments,
  getEstablishments,
} from "./establishments.actions";

const { QUERY_KEY } = ESTABLISHMENTS;

export const useEstablishments = (params?: Record<string, any>) => {
  return useQuery<EstablishmentsResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getEstablishments({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllEstablishments = (params?: Record<string, any>) => {
  return useQuery<EstablishmentsResource[]>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getAllEstablishments({ params }),
    enabled: !!params && !!params.business_partner_id,
    refetchOnWindowFocus: false,
  });
};

export const useEstablishmentsById = (id: number) => {
  return useQuery<EstablishmentsResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findEstablishmentsById(id),
    refetchOnWindowFocus: false,
  });
};
