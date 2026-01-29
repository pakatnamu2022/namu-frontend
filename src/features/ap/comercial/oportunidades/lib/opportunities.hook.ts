import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  OpportunitiesResponse,
  OpportunityResource,
  GetMyOpportunitiesProps,
  GetMyAgendaProps,
  MyAgendaResponse,
  CommercialMastersResponse,
} from "./opportunities.interface";
import {
  getOpportunities,
  getMyOpportunities,
  getMyAgenda,
  getOpportunity,
  getOpportunityActions,
  createOpportunity,
  createOpportunityFromClient,
  updateOpportunity,
  deleteOpportunity,
  getOpportunityActionsList,
  getOpportunityAction,
  createOpportunityAction,
  updateOpportunityAction,
  deleteOpportunityAction,
  getCommercialMasters,
  getFamilies,
  closeOpportunity,
} from "./opportunities.actions";
import {
  OPPORTUNITIES,
  OPPORTUNITY_ACTIONS,
  MASTER_TYPES,
} from "./opportunities.constants";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { OpportunityActionResource } from "./opportunityAction.interface";
import {
  OpportunityActionSchema,
  OpportunitySchema,
} from "./opportunities.schema";

const { QUERY_KEY, MODEL } = OPPORTUNITIES;
const { QUERY_KEY: ACTIONS_QUERY_KEY } = OPPORTUNITY_ACTIONS;

// ==================== OPPORTUNITIES QUERIES ====================

export const useOpportunities = (params?: Record<string, any>) => {
  return useQuery<OpportunitiesResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getOpportunities({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useMyOpportunities = (params: GetMyOpportunitiesProps) => {
  return useQuery<OpportunityResource[]>({
    queryKey: [QUERY_KEY, "my", params],
    queryFn: () => getMyOpportunities(params),
    refetchOnWindowFocus: false,
    // enabled: !!params.worker_id,
  });
};

export const useMyAgenda = (params: GetMyAgendaProps) => {
  return useQuery<MyAgendaResponse>({
    queryKey: [QUERY_KEY, "my-agenda", params],
    queryFn: () => getMyAgenda(params),
    refetchOnWindowFocus: false,
    enabled: !!(params.date_from && params.date_to),
  });
};

export const useOpportunity = (id: number) => {
  return useQuery<OpportunityResource>({
    queryKey: [QUERY_KEY, id],
    queryFn: () => getOpportunity(id),
    refetchOnWindowFocus: false,
    enabled: !!id && id > 0,
  });
};

export const useOpportunityActions = (opportunityId: number) => {
  return useQuery<OpportunityActionResource[]>({
    queryKey: [QUERY_KEY, opportunityId, "actions"],
    queryFn: () => getOpportunityActions(opportunityId),
    refetchOnWindowFocus: false,
    enabled: !!opportunityId && opportunityId > 0,
  });
};

// ==================== OPPORTUNITIES MUTATIONS ====================

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OpportunitySchema & { lead_id: number }) =>
      createOpportunity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast("Oportunidad creada exitosamente");
    },
    onError: () => {
      errorToast("Error al crear la oportunidad");
    },
  });
};

export const useCreateOpportunityFromClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      clientId,
      data,
    }: {
      clientId: number;
      data: Omit<OpportunitySchema, "client_id">;
    }) => createOpportunityFromClient(clientId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast("Oportunidad creada exitosamente");
    },
    onError: (error: any) => {
      errorToast(ERROR_MESSAGE(MODEL, "create", error.response.data.message));
    },
  });
};

export const useUpdateOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<OpportunitySchema>;
    }) => updateOpportunity(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast("Oportunidad actualizada exitosamente");
    },
    onError: (error: any) => {
      errorToast(
        error.response.data.message || "Error al crear la oportunidad",
      );
    },
  });
};

export const useCloseOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      closeOpportunity(id, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast(SUCCESS_MESSAGE(MODEL, "close"));
    },
    onError: (error: any) => {
      errorToast(ERROR_MESSAGE(MODEL, "close", error.response.data.message));
    },
  });
};

export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteOpportunity(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast("Oportunidad eliminada exitosamente");
    },
    onError: () => {
      errorToast("Error al eliminar la oportunidad");
    },
  });
};

// ==================== OPPORTUNITY ACTIONS QUERIES ====================

export const useOpportunityActionsList = (params?: Record<string, any>) => {
  return useQuery<OpportunityActionResource[]>({
    queryKey: [ACTIONS_QUERY_KEY, params],
    queryFn: () => getOpportunityActionsList(params),
    refetchOnWindowFocus: false,
  });
};

export const useOpportunityAction = (id: number) => {
  return useQuery<OpportunityActionResource>({
    queryKey: [ACTIONS_QUERY_KEY, id],
    queryFn: () => getOpportunityAction(id),
    refetchOnWindowFocus: false,
    enabled: !!id && id > 0,
  });
};

// ==================== OPPORTUNITY ACTIONS MUTATIONS ====================

export const useCreateOpportunityAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OpportunityActionSchema) =>
      createOpportunityAction(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ACTIONS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, variables.opportunity_id, "actions"],
      });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, "my-agenda"],
      });
      successToast("Acción creada exitosamente");
    },
    onError: () => {
      errorToast("Error al crear la acción");
    },
  });
};

export const useUpdateOpportunityAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<OpportunityActionSchema>;
    }) => updateOpportunityAction(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [ACTIONS_QUERY_KEY] });
      if (variables.data.opportunity_id) {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY, variables.data.opportunity_id, "actions"],
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, "my-agenda"],
      });
      successToast("Acción actualizada exitosamente");
    },
    onError: () => {
      errorToast("Error al actualizar la acción");
    },
  });
};

export const useDeleteOpportunityAction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteOpportunityAction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ACTIONS_QUERY_KEY] });
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY],
      });
      successToast("Acción eliminada exitosamente");
    },
    onError: () => {
      errorToast("Error al eliminar la acción");
    },
  });
};

// ==================== COMMERCIAL MASTERS ====================

export const useCommercialMasters = (params?: Record<string, any>) => {
  return useQuery<CommercialMastersResponse>({
    queryKey: ["commercialMasters", params],
    queryFn: () => getCommercialMasters({ params }),
    refetchOnWindowFocus: false,
    enabled: !!params,
  });
};

export const useOpportunityStatuses = () => {
  return useCommercialMasters({
    type: MASTER_TYPES.OPPORTUNITY_STATUS,
    open_opportunity_status: 1,
  });
};

export const useClientStatuses = () => {
  return useCommercialMasters({ type: MASTER_TYPES.CLIENT_STATUS });
};

export const useOpportunityTypes = () => {
  return useCommercialMasters({ type: MASTER_TYPES.OPPORTUNITY_TYPE });
};

export const useActionTypes = () => {
  return useCommercialMasters({ type: MASTER_TYPES.ACTION_TYPE });
};

export const useActionContactTypes = () => {
  return useCommercialMasters({ type: MASTER_TYPES.ACTION_CONTACT_TYPE });
};

export const useFamilies = () => {
  return useQuery({
    queryKey: ["families"],
    queryFn: getFamilies,
    refetchOnWindowFocus: false,
  });
};
