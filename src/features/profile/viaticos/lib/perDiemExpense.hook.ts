import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PER_DIEM_EXPENSE } from "./perDiemExpense.constants";
import { PER_DIEM_REQUEST } from "./perDiemRequest.constants";
import {
  storePerDiemExpense,
  updatePerDiemExpense,
  deletePerDiemExpense,
  findPerDiemExpenseById,
  getAvailableExpenseTypes,
  getFlightTicketExpenseTypes,
} from "./perDiemExpense.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";

const { QUERY_KEY, MODEL } = PER_DIEM_EXPENSE;

/**
 * Hook para obtener un gasto por ID
 */
export function usePerDiemExpense(expenseId: number) {
  return useQuery({
    queryKey: [QUERY_KEY, expenseId],
    queryFn: () => findPerDiemExpenseById(expenseId),
    enabled: !!expenseId,
  });
}

/**
 * Hook para crear un nuevo gasto
 */
export function useCreatePerDiemExpense(
  requestId: number,
  options?: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData: FormData) =>
      storePerDiemExpense(requestId, expenseData),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "create"));
      await queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY, requestId],
      });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "create", msg));
      options?.onError?.(error);
    },
  });
}

/**
 * Hook para actualizar un gasto
 */
export function useUpdatePerDiemExpense(
  expenseId: number,
  requestId: number,
  options?: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseData: FormData) =>
      updatePerDiemExpense(expenseId, expenseData),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "update"));
      await queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY, requestId],
      });
      await queryClient.invalidateQueries({
        queryKey: [QUERY_KEY, expenseId],
      });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
      options?.onError?.(error);
    },
  });
}

/**
 * Hook para eliminar un gasto
 */
export function useDeletePerDiemExpense(
  requestId: number,
  options?: {
    onSuccess?: () => void;
    onError?: (error: any) => void;
  }
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: number) => deletePerDiemExpense(expenseId),
    onSuccess: async () => {
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
      await queryClient.invalidateQueries({
        queryKey: [PER_DIEM_REQUEST.QUERY_KEY, requestId],
      });
      options?.onSuccess?.();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
      options?.onError?.(error);
    },
  });
}

/**
 * Hook para obtener los tipos de gasto disponibles para una solicitud de viáticos
 */
export function useAvailableExpenseTypes(requestId: number) {
  return useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, requestId, "available-expense-types"],
    queryFn: () => getAvailableExpenseTypes(requestId),
    enabled: !!requestId,
    retry: false,
  });
}

/**
 * Hook para obtener los tipos de gasto de boletos aéreos
 */
export function useFlightTicketExpenseTypes(requestId: number) {
  return useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, requestId, "flight-ticket-expense-types"],
    queryFn: () => getFlightTicketExpenseTypes(requestId),
    enabled: !!requestId,
    retry: false,
  });
}
