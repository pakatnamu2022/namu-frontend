import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CycleResource,
  CycleResponse,
  WeightsPreviewResponse,
} from "./cycle.interface";
import {
  findCycleById,
  getAllCycle,
  getCategoriesInCycle,
  getChiefsInCycle,
  getCycle,
  getCyclePersonDetails,
  getCycleWeightsPreview,
  getPersonsInCycle,
  getPositionsInCycle,
  regenerateCycleWeights,
} from "./cycle.actions";

export const useCycles = (params?: Record<string, any>) => {
  return useQuery<CycleResponse>({
    queryKey: ["cycle", params],
    queryFn: () => getCycle({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllCycles = (params?: Record<string, any>) => {
  return useQuery<CycleResource[]>({
    queryKey: ["cycleAll", params],
    queryFn: () => getAllCycle({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useCycle = (id: number) => {
  return useQuery<CycleResource>({
    queryKey: ["cycleById", id],
    queryFn: () => findCycleById(id.toString()),
    refetchOnWindowFocus: false,
  });
};

export const useCycleDetails = (
  idCycle: number,
  params?: Record<string, any>,
) => {
  return useQuery({
    queryKey: ["cycle", idCycle, params],
    queryFn: () => getCyclePersonDetails(idCycle.toString(), params),
    refetchOnWindowFocus: false,
  });
};

export const usePersonsInCycle = (params: Record<string, any>) => {
  const { idCycle } = params;
  return useQuery({
    queryKey: ["cycle", idCycle, "persons"],
    queryFn: () => getPersonsInCycle(idCycle.toString()),
    refetchOnWindowFocus: false,
  });
};

export const usePositionsInCycle = (idCycle: number) => {
  return useQuery({
    queryKey: ["cycle", idCycle, "positions"],
    queryFn: () => getPositionsInCycle(idCycle.toString()),
    refetchOnWindowFocus: false,
  });
};

export const useCategoriesInCycle = (idCycle: number) => {
  return useQuery({
    queryKey: ["cycle", idCycle, "categories"],
    queryFn: () => getCategoriesInCycle(idCycle.toString()),
    refetchOnWindowFocus: false,
  });
};

export const useChiefsInCycle = (idCycle: number) => {
  return useQuery({
    queryKey: ["cycle", idCycle, "chiefs"],
    queryFn: () => getChiefsInCycle(idCycle.toString()),
    refetchOnWindowFocus: false,
  });
};

export const useCycleWeightsPreview = (cycleId: number, enabled = false) => {
  return useQuery<WeightsPreviewResponse>({
    queryKey: ["cycle", cycleId, "weights-preview"],
    queryFn: () => getCycleWeightsPreview(cycleId),
    refetchOnWindowFocus: false,
    enabled,
  });
};

export const useRegenerateCycleWeights = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cycleId: number) => regenerateCycleWeights(cycleId),
    onSuccess: (_, cycleId) => {
      queryClient.invalidateQueries({
        queryKey: ["cycle", cycleId, "weights-preview"],
      });
    },
  });
};
