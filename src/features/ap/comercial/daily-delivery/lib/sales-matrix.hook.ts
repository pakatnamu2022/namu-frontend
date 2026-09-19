import { useQuery } from "@tanstack/react-query";
import { api } from "@/core/api";
import { SalesMatrixParams, SalesMatrixResponse } from "./sales-matrix.interface";

export const SALES_MATRIX_ENDPOINT =
  "/ap/commercial/reports/vehicle-sales-matrix";

export const getSalesMatrix = async (
  params: SalesMatrixParams,
): Promise<SalesMatrixResponse> => {
  const response = await api.get<SalesMatrixResponse>(SALES_MATRIX_ENDPOINT, {
    params,
  });
  return response.data;
};

export const useSalesMatrix = (params: SalesMatrixParams) =>
  useQuery<SalesMatrixResponse>({
    queryKey: ["sales-matrix", params],
    queryFn: () => getSalesMatrix(params),
    refetchOnWindowFocus: false,
  });
