import { useQuery } from "@tanstack/react-query";
import {
  IncomeSectorResource,
  IncomeSectorResponse,
} from "./incomeSector.interface";
import { getAllIncomeSector, getIncomeSector } from "./incomeSector.actions";
import { INCOME_SECTOR } from "./incomeSector.constants";

const { QUERY_KEY } = INCOME_SECTOR;

export const useIncomeSector = (params?: Record<string, any>) => {
  return useQuery<IncomeSectorResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getIncomeSector({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllIncomeSector = (params?: Record<string, any>) => {
  return useQuery<IncomeSectorResource[]>({
    queryKey: [QUERY_KEY],
    queryFn: () => getAllIncomeSector({ params }),
    refetchOnWindowFocus: false,
  });
};

// export const useIncomeSectorById = (id: number) => {
//   return useQuery({
//     queryKey: [QUERY_KEY, id],
//     queryFn: () => findIncomeSectorById(id),
//     refetchOnWindowFocus: false,
//   });
// };
