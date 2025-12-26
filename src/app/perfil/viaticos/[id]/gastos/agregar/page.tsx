"use client";

import { useParams, useNavigate } from "react-router-dom";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import ExpenseForm from "@/features/profile/viaticos/components/ExpenseForm";
import { ExpenseSchema } from "@/features/profile/viaticos/lib/expense.schema";
import { useCreatePerDiemExpense } from "@/features/profile/viaticos/lib/perDiemExpense.hook";
import { expenseSchemaToFormData } from "@/features/profile/viaticos/lib/perDiemExpense.utils";
import { useFindPerDiemRequestById } from "@/features/profile/viaticos/lib/perDiemRequest.hook";
import { Loader } from "lucide-react";

export default function AddExpensePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: perDiemRequest, isLoading: isLoadingRequest } =
    useFindPerDiemRequestById(Number(id));

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

  if (isLoadingRequest) {
    return (
      <FormWrapper>
        <div className="flex items-center justify-center py-8">
          <Loader className="h-6 w-6 animate-spin" />
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
        title="Agregar Gasto"
        mode="create"
        icon="Receipt"
      />
      <ExpenseForm
        requestId={Number(id)}
        onSubmit={handleSubmit}
        isSubmitting={isPending}
        mode="create"
        onCancel={handleCancel}
        startDate={startDate}
        endDate={endDate}
      />
    </FormWrapper>
  );
}
