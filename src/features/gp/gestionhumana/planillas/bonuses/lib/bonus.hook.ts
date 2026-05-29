import { useQuery } from "@tanstack/react-query";
import { BonusResource, BonusResponse } from "./bonus.interface";
import { findBonusById, getBonuses } from "./bonus.actions";
import { BONUS } from "./bonus.constant";

const { QUERY_KEY } = BONUS;

export const useBonuses = (params?: Record<string, any>) => {
  return useQuery<BonusResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getBonuses(params),
    refetchOnWindowFocus: false,
  });
};

export const useBonusById = (id: number) => {
  return useQuery<BonusResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findBonusById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
