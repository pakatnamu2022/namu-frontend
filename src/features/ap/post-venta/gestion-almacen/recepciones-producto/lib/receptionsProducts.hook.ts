import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ReceptionResource,
  ReceptionResponse,
} from "./receptionsProducts.interface.ts";
import {
  findReceptionById,
  getAllReceptions,
  getReceptions,
  updateDetailCreditNote,
} from "./receptionsProducts.actions.ts";
import { RECEPTION } from "./receptionsProducts.constants.ts";

const { QUERY_KEY } = RECEPTION;

export const useReceptions = (
  params?: Record<string, any>,
  purchaseOrderId?: number,
) => {
  return useQuery<ReceptionResponse>({
    queryKey: [QUERY_KEY, params, purchaseOrderId],
    queryFn: () => getReceptions({ params, purchaseOrderId }),
    refetchOnWindowFocus: false,
  });
};

export const useAllReceptions = (params?: Record<string, any>) => {
  return useQuery<ReceptionResource[]>({
    queryKey: [QUERY_KEY, "all", params],
    queryFn: () => getAllReceptions({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useReceptionById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findReceptionById(id),
    refetchOnWindowFocus: false,
  });
};

export const useUpdateDetailCreditNote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      detailId,
      isCreditNote,
    }: {
      detailId: number;
      isCreditNote: boolean;
    }) => updateDetailCreditNote(detailId, isCreditNote),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
    },
  });
};
