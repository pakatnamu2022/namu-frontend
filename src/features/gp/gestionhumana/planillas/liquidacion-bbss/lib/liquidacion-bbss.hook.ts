import { useQuery } from "@tanstack/react-query";
import {
  LiquidacionBbssResource,
  LiquidacionBbssResponse,
  LiquidacionBbssPivotResponse,
} from "./liquidacion-bbss.interface";
import {
  findLiquidacionBbssById,
  getLiquidacionesBbss,
  getLiquidacionesBbssPivot,
} from "./liquidacion-bbss.actions";
import { LIQUIDACION_BBSS } from "./liquidacion-bbss.constant";

const { QUERY_KEY } = LIQUIDACION_BBSS;

export const useLiquidacionesBbss = (params?: Record<string, any>) => {
  const { year, company_id, ...rest } = params ?? {};
  const enabled = !!year && !!company_id;
  return useQuery<LiquidacionBbssResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getLiquidacionesBbss({ year, company_id, ...rest }),
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useLiquidacionesBbssPivot = (params?: Record<string, any>) => {
  const { period_id, ...rest } = params ?? {};
  const enabled = !!period_id;
  return useQuery<LiquidacionBbssPivotResponse>({
    queryKey: [QUERY_KEY, "pivot", params],
    queryFn: () => getLiquidacionesBbssPivot({ period_id, ...rest }),
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useLiquidacionBbssById = (id: number) => {
  return useQuery<LiquidacionBbssResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findLiquidacionBbssById(id),
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
};
