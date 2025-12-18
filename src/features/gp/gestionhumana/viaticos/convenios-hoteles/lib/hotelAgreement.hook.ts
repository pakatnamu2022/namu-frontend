import { useQuery } from "@tanstack/react-query";
import { HOTEL_AGREEMENT } from "./hotelAgreement.constants";
import { getHotelAgreementProps } from "./hotelAgreement.interface";
import {
  findHotelAgreementById,
  getAllHotelAgreement,
  getHotelAgreement,
} from "./hotelAgreement.actions";

const { QUERY_KEY } = HOTEL_AGREEMENT;

export function useGetHotelAgreement(props: getHotelAgreementProps) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getHotelAgreement(props),
  });
}

export function useGetAllHotelAgreement(props: getHotelAgreementProps) {
  return useQuery({
    queryKey: [QUERY_KEY, "all", props],
    queryFn: () => getAllHotelAgreement(props),
  });
}

export function useFindHotelAgreementById(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findHotelAgreementById(id),
    enabled: !!id,
  });
}
