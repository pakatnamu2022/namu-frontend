"use client";

import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import FormWrapper from "@/shared/components/FormWrapper";
import TitleFormComponent from "@/shared/components/TitleFormComponent";
import ExpenseForm from "@/features/profile/viaticos/components/ExpenseForm";
import { ExpenseSchema } from "@/features/profile/viaticos/lib/expense.schema";
import { PER_DIEM_REQUEST } from "@/features/profile/viaticos/lib/perDiemRequest.constants";
import { PER_DIEM_EXPENSE } from "@/features/profile/viaticos/lib/perDiemExpense.constants";
import { findPerDiemRequestById } from "@/features/profile/viaticos/lib/perDiemRequest.actions";
import { findPerDiemExpenseById } from "@/features/profile/viaticos/lib/perDiemExpense.actions";
import { useUpdatePerDiemExpense } from "@/features/profile/viaticos/lib/perDiemExpense.hook";
import { expenseSchemaToFormData } from "@/features/profile/viaticos/lib/perDiemExpense.utils";
import FormSkeleton from "@/shared/components/FormSkeleton";
import { successToast, errorToast } from "@/core/core.function";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";

export default function UpdateExpensePage() {
  const { id, expenseId } = useParams<{ id: string; expenseId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingData, setPendingData] = useState<ExpenseSchema | null>(null);

  // Obtener los datos de la solicitud de viáticos para las fechas
  const { data: perDiemRequest, isLoading: isLoadingRequest } = useQuery({
    queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
    queryFn: () => findPerDiemRequestById(Number(id)),
    enabled: !!id,
  });

  // Obtener el gasto específico por su ID
  const { data: expense, isLoading: isLoadingExpense } = useQuery({
    queryKey: [PER_DIEM_EXPENSE.QUERY_KEY, expenseId],
    queryFn: () => findPerDiemExpenseById(Number(expenseId)),
    enabled: !!expenseId,
  });

  const { mutate, isPending } = useUpdatePerDiemExpense(
    Number(expenseId),
    Number(id)
  );

  const handleSubmit = (data: ExpenseSchema) => {
    setPendingData(data);
    setShowConfirmModal(true);
  };

  const handleConfirmUpdate = () => {
    if (pendingData) {
      const formData = expenseSchemaToFormData(pendingData);
      mutate(formData, {
        onSuccess: () => {
          // Invalidar queries para refrescar los datos
          queryClient.invalidateQueries({
            queryKey: [PER_DIEM_REQUEST.QUERY_KEY, id],
          });
          queryClient.invalidateQueries({
            queryKey: [PER_DIEM_EXPENSE.QUERY_KEY, expenseId],
          });

          successToast(
            "Gasto actualizado",
            "El gasto ha sido actualizado exitosamente."
          );
          setShowConfirmModal(false);
          setPendingData(null);
          navigate(`/perfil/viaticos/${id}`);
        },
        onError: (error: any) => {
          errorToast(
            "Error al actualizar",
            error.response?.data?.message ||
              "No se pudo actualizar el gasto. Inténtalo de nuevo."
          );
        },
      });
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setPendingData(null);
  };

  const handleCancel = () => {
    navigate(`/perfil/viaticos/${id}`);
  };

  const isLoading = isLoadingRequest || isLoadingExpense;

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
    <>
      <FormWrapper>
        <TitleFormComponent
          title="Actualizar Gasto"
          mode="edit"
          icon="Receipt"
        />
        <ExpenseForm
          requestId={Number(id)}
          defaultValues={{
            expense_date: new Date(expense.expense_date),
            expense_type_id: expense.expense_type.id.toString(),
            receipt_amount: expense.receipt_amount,
            receipt_type: expense.receipt_type as any,
            receipt_number: expense.receipt_number || "",
            ruc: expense.ruc || "",
            notes: expense.notes || "",
          }}
          onSubmit={handleSubmit}
          isSubmitting={isPending}
          mode="update"
          onCancel={handleCancel}
          startDate={startDate}
          endDate={endDate}
          existingFileUrl={expense.receipt_path}
        />
      </FormWrapper>

      <GeneralModal
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        title="¿Confirmar actualización?"
        subtitle="Estás a punto de actualizar este gasto. ¿Deseas continuar?"
        icon="AlertCircle"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Se actualizarán los datos del gasto con la información que has
            proporcionado.
          </p>
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancelConfirm}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleConfirmUpdate}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              {isPending ? "Actualizando..." : "Confirmar"}
            </Button>
          </div>
        </div>
      </GeneralModal>
    </>
  );
}
