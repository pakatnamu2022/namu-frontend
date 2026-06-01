import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getGpMasters,
  getGpMastersById,
  createGpMasters,
  updateGpMasters,
  deleteGpMasters,
} from "./gpMaster.actions";
import { GP_MASTERS } from "./gpMaster.constants";
import { getGpMastersProps, GpMastersRequest } from "./gpMaster.interface";

export const useGpMasters = ({ params }: getGpMastersProps = {}) => {
  return useQuery({
    queryKey: [GP_MASTERS.QUERY_KEY, params],
    queryFn: () => getGpMasters({ params }),
  });
};

export const useGpMastersById = (id: number) => {
  return useQuery({
    queryKey: [GP_MASTERS.QUERY_KEY, id],
    queryFn: () => getGpMastersById(id),
    enabled: !!id && id > 0,
  });
};

export const useCreateGpMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: GpMastersRequest) => createGpMasters(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GP_MASTERS.QUERY_KEY],
      });
    },
  });
};

export const useUpdateGpMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: number;
      body: Partial<GpMastersRequest>;
    }) => updateGpMasters(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GP_MASTERS.QUERY_KEY],
      });
    },
  });
};

export const useDeleteGpMasters = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGpMasters(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [GP_MASTERS.QUERY_KEY],
      });
    },
  });
};
