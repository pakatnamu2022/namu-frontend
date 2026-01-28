import { useQuery } from "@tanstack/react-query";
import {
  getAllTransferReceptions,
  getTransferReceptionById,
  getTransferReceptions,
} from "./transferReception.actions.ts";
import { TRANSFER_RECEPTION } from "./transferReception.constants.ts";

const { QUERY_KEY } = TRANSFER_RECEPTION;

export const useTransferReceptions = (
  params: Record<string, any> = {},
  productTransferId?: number
) => {
  return useQuery({
    queryKey: [QUERY_KEY, params, productTransferId],
    queryFn: () => getTransferReceptions({ params, productTransferId }),
  });
};

export const useAllTransferReceptions = (
  params: Record<string, any> = {},
  productTransferId?: number
) => {
  return useQuery({
    queryKey: [QUERY_KEY, "all", params, productTransferId],
    queryFn: () => getAllTransferReceptions({ params, productTransferId }),
  });
};

export const useTransferReceptionById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getTransferReceptionById(id),
    enabled: !!id && id > 0,
  });
};
