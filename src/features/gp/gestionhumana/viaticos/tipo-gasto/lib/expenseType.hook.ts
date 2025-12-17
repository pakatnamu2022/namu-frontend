import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getExpenseTypes,
  getAllExpenseTypes,
  getActiveExpenseTypes,
  findExpenseTypeById,
  storeExpenseType,
  updateExpenseType,
  deleteExpenseType,
} from "./expenseType.actions";
import { EXPENSE_TYPE } from "./expenseType.constants";
import type { getExpenseTypeProps, ExpenseTypeRequest } from "./expenseType.interface";

export const useExpenseTypes = (props?: getExpenseTypeProps) => {
  return useQuery({
    queryKey: [EXPENSE_TYPE.QUERY_KEY, props?.params],
    queryFn: () => getExpenseTypes(props || {}),
  });
};

export const useAllExpenseTypes = (props?: getExpenseTypeProps) => {
  return useQuery({
    queryKey: [EXPENSE_TYPE.QUERY_KEY, "all", props?.params],
    queryFn: () => getAllExpenseTypes(props),
  });
};

export const useActiveExpenseTypes = (props?: getExpenseTypeProps) => {
  return useQuery({
    queryKey: [EXPENSE_TYPE.QUERY_KEY, "active", props?.params],
    queryFn: () => getActiveExpenseTypes(props),
  });
};

export const useExpenseType = (id: number) => {
  return useQuery({
    queryKey: [EXPENSE_TYPE.QUERY_KEY, id],
    queryFn: () => findExpenseTypeById(id),
    enabled: !!id,
  });
};

export const useStoreExpenseType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ExpenseTypeRequest) => storeExpenseType(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSE_TYPE.QUERY_KEY] });
    },
  });
};

export const useUpdateExpenseType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ExpenseTypeRequest }) =>
      updateExpenseType(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSE_TYPE.QUERY_KEY] });
    },
  });
};

export const useDeleteExpenseType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteExpenseType(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EXPENSE_TYPE.QUERY_KEY] });
    },
  });
};
