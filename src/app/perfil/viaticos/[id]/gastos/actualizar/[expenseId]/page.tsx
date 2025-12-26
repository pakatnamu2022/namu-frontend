"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import ExpenseForm from "@/features/profile/viaticos/components/ExpenseForm";
import { ExpenseSchema } from "@/features/profile/viaticos/lib/expense.schema";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import { findPerDiemRequestById } from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { useUpdatePerDiemExpense } from "@/features/profile/viaticos/lib/perDiemExpense.hook";
import { expenseSchemaToFormData } from "@/features/profile/viaticos/lib/perDiemExpense.utils";
import FormSkeleton from "@/shared/components/FormSkeleton";

export default function UpdateExpensePage() {
  const { id, expenseId } = useParams<{ id: string; expenseId: string }>();
  const navigate = useNavigate();

  // Obtener los datos de la solicitud de viáticos para acceder a los gastos
  const { data: perDiemRequest, isLoading } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
  });

  // Buscar el gasto específico en los expenses
  const expense = perDiemRequest?.expenses?.find(
    (exp) => exp.id === Number(expenseId)
  );

  const { mutate, isPending } = useUpdatePerDiemExpense(
    Number(expenseId),
    Number(id),
    {
      onSuccess: () => {
        navigate(`/perfil/viaticos/${id}`);
      },
    }
  );

  const handleSubmit = (data: ExpenseSchema) => {
    const formData = expenseSchemaToFormData(data);
    // Agregar _method para Laravel
    formData.append("_method", "PUT");
    mutate(formData);
  };

  const handleCancel = () => {
    navigate(`/perfil/viaticos/${id}`);
  };

  if (isLoading) {
    return (
      <FormWrapper>
        <FormSkeleton />
      </FormWrapper>
    );
  }

  if (!expense) {
    return (
      <FormWrapper>
        <div className="text-center py-8">
          <p className="text-muted-foreground">No se encontró el gasto</p>
        </div>
      </FormWrapper>
    );
  }

  const startDate = perDiemRequest?.start_date
    ? new Date(perDiemRequest.start_date)
    : undefined;
  const endDate = perDiemRequest?.end_date
    ? new Date(perDiemRequest.end_date)
    : undefined;

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Actualizar Gasto"
        mode="edit"
        icon="Receipt"
      />
      <ExpenseForm
        requestId={Number(id)}
        defaultValues={{
          expense_date: expense.expense_date as any,
          expense_type_id: expense.expense_type.id.toString(),
          receipt_amount: expense.receipt_amount,
          receipt_type: expense.receipt_type as any,
          receipt_number: expense.receipt_number || "",
          notes: expense.notes || "",
        }}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="update"
        onCancel={handleCancel}
        startDate={startDate}
        endDate={endDate}
      />
    </FormWrapper>
  );
}
