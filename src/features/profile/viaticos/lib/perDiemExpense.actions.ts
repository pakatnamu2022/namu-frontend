import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PER_DIEM_EXPENSE } from "./perDiemExpense.constants";
import { PerDiemExpenseResource, RemainingBudgetResponse } from "./perDiemExpense.interface";
import { ExpenseTypeResource } from "@/features/gp/gestionhumana/viaticos/tipo-gasto/lib/expenseType.interface";

const { ENDPOINT } = PER_DIEM_EXPENSE;

/**
 * Crear un nuevo gasto para una solicitud de viáticos
 */
export async function storePerDiemExpense(
  requestId: number,
  expenseData: FormData
): Promise<PerDiemExpenseResource> {
  const response = await api.post<PerDiemExpenseResource>(
    `gp/gestion-humana/viaticos/per-diem-requests/${requestId}/expenses`,
    expenseData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

/**
 * Actualizar un gasto existente
 */
export async function updatePerDiemExpense(
  expenseId: number,
  expenseData: FormData
): Promise<PerDiemExpenseResource> {
  const response = await api.post<PerDiemExpenseResource>(
    `${ENDPOINT}/${expenseId}`,
    expenseData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return response.data;
}

/**
 * Eliminar un gasto
 */
export async function deletePerDiemExpense(
  expenseId: number
): Promise<GeneralResponse> {
  const { data } = await api.delete<GeneralResponse>(
    `${ENDPOINT}/${expenseId}`
  );
  return data;
}

/**
 * Obtener un gasto por ID
 */
export async function findPerDiemExpenseById(
  expenseId: number
): Promise<PerDiemExpenseResource> {
  const response = await api.get<PerDiemExpenseResource>(
    `${ENDPOINT}/${expenseId}`
  );
  return response.data;
}

/**
 * Obtener el presupuesto restante para un tipo de gasto en una fecha específica
 */
export async function getRemainingBudget(
  requestId: number,
  date: string,
  expenseTypeId: number
): Promise<RemainingBudgetResponse> {
  const response = await api.get<RemainingBudgetResponse>(
    `gp/gestion-humana/viaticos/per-diem-requests/${requestId}/remaining-budget`,
    {
      params: {
        date,
        expense_type_id: expenseTypeId,
      },
    }
  );
  return response.data;
}

/**
 * Obtener los tipos de gasto disponibles para una solicitud de viáticos
 */
export async function getAvailableExpenseTypes(
  requestId: number
): Promise<ExpenseTypeResource[]> {
  const response = await api.get<ExpenseTypeResource[]>(
    `gp/gestion-humana/viaticos/per-diem-requests/${requestId}/available-expense-types`
  );
  return response.data;
}
