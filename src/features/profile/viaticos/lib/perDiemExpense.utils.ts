import { ExpenseSchema } from "./expense.schema";

/**
 * Convierte los datos del schema de expense a FormData
 */
export function expenseSchemaToFormData(data: ExpenseSchema): FormData {
  const formData = new FormData();

  // Convertir Date a string si es necesario
  const expenseDate = data.expense_date instanceof Date
    ? data.expense_date.toISOString().split('T')[0]
    : data.expense_date;

  formData.append("expense_date", expenseDate);
  formData.append("expense_type_id", data.expense_type_id);
  formData.append("receipt_amount", data.receipt_amount.toString());
  formData.append("receipt_type", data.receipt_type);

  if (data.receipt_number) {
    formData.append("receipt_number", data.receipt_number);
  }

  if (data.receipt_file) {
    formData.append("receipt_file", data.receipt_file);
  }

  if (data.notes) {
    formData.append("notes", data.notes);
  }

  return formData;
}
