import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  ApMastersRequest,
  getApMastersProps,
} from "./apMasters.interface";
import {
  createApMasters,
  deleteApMasters,
  getApMasters,
  getApMastersById,
  getApMastersTypes,
  updateApMasters,
} from "./apMasters.actions";
import { AP_MASTERS } from "./apMaster.constants";

export const useApMasters = ({ params }: getApMastersProps = {}) => {
  return useQuery({
    queryKey: [AP_MASTERS.QUERY_KEY, params],
    queryFn: () => getApMasters({ params }),
  });
};

export const useApMastersById = (id: number) => {
  return useQuery({
    queryKey: [AP_MASTERS.QUERY_KEY, id],
    queryFn: () => getApMastersById(id),
    enabled: !!id && id > 0,
  });
};

export const useCreateApMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: ApMastersRequest) => createApMasters(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AP_MASTERS.QUERY_KEY],
      });
    },
  });
};

export const useUpdateApMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: Partial<ApMastersRequest>;
    }) => updateApMasters(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AP_MASTERS.QUERY_KEY],
      });
    },
  });
};

export const useDeleteApMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteApMasters(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [AP_MASTERS.QUERY_KEY],
      });
    },
  });
};

export const useApMastersTypes = () => {
  return useQuery({
    queryKey: [AP_MASTERS.QUERY_KEY, "types"],
    queryFn: getApMastersTypes,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
};
