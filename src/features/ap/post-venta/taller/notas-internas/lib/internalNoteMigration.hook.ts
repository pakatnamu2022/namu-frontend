import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getInternalNoteMigration,
  verifyInternalNoteMigration,
  updateInternalNoteAccountingStatus,
} from "./internalNoteMigration.actions";
import { getInternalNoteMigrationProps } from "./internalNoteMigration.interface";
import { INTERNAL_NOTE_MIGRATION } from "./internalNoteMigration.constants";
import { errorToast, successToast } from "@/core/core.function";

const { QUERY_KEY } = INTERNAL_NOTE_MIGRATION;

export function useGetInternalNoteMigration(
  props: getInternalNoteMigrationProps,
) {
  return useQuery({
    queryKey: [QUERY_KEY, props],
    queryFn: () => getInternalNoteMigration(props),
    enabled: props.enabled !== false,
  });
}

export function useVerifyInternalNoteMigration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => verifyInternalNoteMigration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast("Migración de nota interna verificada");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Error al verificar la migración de la nota interna";
      errorToast(errorMessage);
    },
  });
}

export function useUpdateInternalNoteAccountingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => updateInternalNoteAccountingStatus(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      successToast("Estado contable de la nota interna actualizado");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        "Error al actualizar el estado contable de la nota interna";
      errorToast(errorMessage);
    },
  });
}
