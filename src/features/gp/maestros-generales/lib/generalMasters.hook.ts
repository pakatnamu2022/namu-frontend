import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  GeneralMastersRequest,
  getGeneralMastersProps,
} from "./generalMasters.interface";
import {
  getGeneralMasters,
  getGeneralMastersById,
  createGeneralMasters,
  updateGeneralMasters,
  deleteGeneralMasters,
  getGeneralMastersTypes,
  getGeneralMasterByCode,
} from "./generalMasters.actions";
import { GENERAL_MASTERS } from "./generalMasters.constants";

export const useGeneralMasters = ({ params }: getGeneralMastersProps = {}) => {
  return useQuery({
    queryKey: [GENERAL_MASTERS.QUERY_KEY, params],
    queryFn: () => getGeneralMasters({ params }),
  });
};

export const useGeneralMastersById = (id: number) => {
  return useQuery({
    queryKey: [GENERAL_MASTERS.QUERY_KEY, id],
    queryFn: () => getGeneralMastersById(id),
    enabled: !!id && id > 0,
  });
};

export const useCreateGeneralMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GeneralMastersRequest) => createGeneralMasters(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GENERAL_MASTERS.QUERY_KEY],
      });
    },
  });
};

export const useUpdateGeneralMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: Partial<GeneralMastersRequest>;
    }) => updateGeneralMasters(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GENERAL_MASTERS.QUERY_KEY],
      });
    },
  });
};

export const useDeleteGeneralMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGeneralMasters(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GENERAL_MASTERS.QUERY_KEY],
      });
    },
  });
};

export const useGeneralMastersTypes = () => {
  return useQuery({
    queryKey: [GENERAL_MASTERS.QUERY_KEY, "types"],
    queryFn: getGeneralMastersTypes,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};

export const useGeneralMasterByCode = (code: string) => {
  return useQuery({
    queryKey: [GENERAL_MASTERS.QUERY_KEY, "code", code],
    queryFn: () => getGeneralMasterByCode(code),
    enabled: !!code,
  });
};
