"use client";

import { useParams, useNavigate } from "react-router-dom";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import ExpenseForm from "@/features/profile/viaticos/components/ExpenseForm";
import { ExpenseSchema } from "@/features/profile/viaticos/lib/expense.schema";
import { useCreatePerDiemExpense } from "@/features/profile/viaticos/lib/perDiemExpense.hook";
import { expenseSchemaToFormData } from "@/features/profile/viaticos/lib/perDiemExpense.utils";

export default function AddExpensePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { mutate, isPending } = useCreatePerDiemExpense(Number(id), {
    onSuccess: () => {
      navigate(`/perfil/viaticos/${id}`);
    },
  });

  const handleSubmit = (data: ExpenseSchema) => {
    const formData = expenseSchemaToFormData(data);
    mutate(formData);
  };

  const handleCancel = () => {
    navigate(`/perfil/viaticos/${id}`);
  };

  return (
    <FormWrapper>
      <TitleFormComponent
        title="Agregar Gasto"
        mode="create"
        icon="Receipt"
      />
      <ExpenseForm
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={handleCancel}
      />
    </FormWrapper>
  );
}
