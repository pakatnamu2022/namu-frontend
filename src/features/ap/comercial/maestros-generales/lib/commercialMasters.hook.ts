import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  CommercialMastersRequest,
  getCommercialMastersProps,
} from "./commercialMasters.interface";
import {
  getCommercialMasters,
  getCommercialMastersById,
  createCommercialMasters,
  updateCommercialMasters,
  deleteCommercialMasters,
} from "./commercialMasters.actions";
import { COMMERCIAL_MASTERS } from "./commercialMasters.constants";

export const useCommercialMasters = ({
  params,
}: getCommercialMastersProps = {}) => {
  return useQuery({
    queryKey: [COMMERCIAL_MASTERS.QUERY_KEY, params],
    queryFn: () => getCommercialMasters({ params }),
  });
};

export const useCommercialMastersById = (id: number) => {
  return useQuery({
    queryKey: [COMMERCIAL_MASTERS.QUERY_KEY, id],
    queryFn: () => getCommercialMastersById(id),
    enabled: !!id && id > 0,
  });
};

export const useCreateCommercialMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CommercialMastersRequest) =>
      createCommercialMasters(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COMMERCIAL_MASTERS.QUERY_KEY],
      });
    },
  });
};

export const useUpdateCommercialMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: Partial<CommercialMastersRequest>;
    }) => updateCommercialMasters(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COMMERCIAL_MASTERS.QUERY_KEY],
      });
    },
  });
};

export const useDeleteCommercialMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCommercialMasters(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [COMMERCIAL_MASTERS.QUERY_KEY],
      });
    },
  });
};
