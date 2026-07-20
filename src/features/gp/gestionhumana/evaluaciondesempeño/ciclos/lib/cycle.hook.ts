import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CycleResource,
  CycleResponse,
  WeightsPreviewResponse,
  RemoveObjectivePreviewResponse,
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
  getRemoveObjectivePreview,
  regenerateCycleWeights,
  removeObjectiveFromCycle,
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
  });
};

export const usePersonsInCycle = (params: Record<string, any>) => {
  const { idCycle, ...rest } = params;
  return useQuery({
    queryKey: ["cycle", idCycle, "persons", rest],
    queryFn: () => getPersonsInCycle(idCycle.toString(), rest),
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

export const useRemoveObjectivePreview = (
  cycleId: number,
  objectiveId: number | null,
  enabled = false,
) => {
  return useQuery<RemoveObjectivePreviewResponse>({
    queryKey: ["cycle", cycleId, "objective", objectiveId, "remove-preview"],
    queryFn: () => getRemoveObjectivePreview(cycleId, objectiveId as number),
    refetchOnWindowFocus: false,
    enabled: enabled && !!objectiveId,
  });
};

export const useRemoveObjectiveFromCycle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cycleId,
      objectiveId,
      personIds,
    }: {
      cycleId: number;
      objectiveId: number;
      personIds?: number[];
    }) => removeObjectiveFromCycle(cycleId, objectiveId, personIds),
    onSuccess: (_, { cycleId }) => {
      queryClient.invalidateQueries({ queryKey: ["cycle", cycleId] });
    },
  });
};
