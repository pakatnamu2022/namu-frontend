import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { PER_DIEM_EXPENSE } from "./perDiemExpense.constants";
import { PerDiemExpenseResource } from "./perDiemExpense.interface";

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
