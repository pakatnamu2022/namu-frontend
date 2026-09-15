"use client";

import { useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { GeneralModal } from "@/shared/components/GeneralModal";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import {
  BUDGETS,
  BUDGET_TYPE_OPTIONS,
} from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.constants";
import { useBudgetsById } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.hook";
import { useAllActivities } from "@/features/ap/comercial/marketing/actividades/lib/activities.hook";
import {
  storeActivities,
  deleteActivities,
  changeActivityStatus,
} from "@/features/ap/comercial/marketing/actividades/lib/activities.actions";
import { ActivitiesForm } from "@/features/ap/comercial/marketing/actividades/components/ActivitiesForm";
import { ActivitiesSchema } from "@/features/ap/comercial/marketing/actividades/lib/activities.schema";
import { ACTIVITIES } from "@/features/ap/comercial/marketing/actividades/lib/activities.constants";
import ActivitiesTable from "@/features/ap/comercial/marketing/actividades/components/ActivitiesTable";
import ActivitiesOptions from "@/features/ap/comercial/marketing/actividades/components/ActivitiesOptions";
import { activitiesColumns } from "@/features/ap/comercial/marketing/actividades/components/ActivitiesColumns";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function BudgetActivitiesPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { currentView, checkRouteExists, isLoadingModule } = useCurrentModule();
  const { ROUTE, ABSOLUTE_ROUTE } = BUDGETS;
  const budgetId = Number(id);
  const permissions = useModulePermissions(ACTIVITIES.ROUTE);

  const [creating, setCreating] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const { data: budget, isLoading: loadingBudget } = useBudgetsById(budgetId);
  const {
    data: activities = [],
    isLoading: loadingActivities,
    refetch,
  } = useAllActivities(
    budgetId
      ? {
          budget_id: budgetId,
          search: search || undefined,
          status: status || undefined,
        }
      : undefined,
  );

  const { mutate, isPending } = useMutation({
    mutationFn: storeActivities,
    onSuccess: async () => {
      successToast("Actividad agregada correctamente");
      setCreating(false);
      await queryClient.invalidateQueries({ queryKey: [ACTIVITIES.QUERY_KEY] });
      await refetch();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || "";
      errorToast(
        ERROR_MESSAGE({ name: "Actividad", gender: true }, "create", msg),
      );
    },
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteActivities(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(ACTIVITIES.MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(ACTIVITIES.MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleChangeStatus = async (activityId: number, status: string) => {
    try {
      await changeActivityStatus(activityId, status);
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  if (isLoadingModule || loadingBudget) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();
  if (!budget) notFound();

  const budgetLabel = `${budget.plan?.name ?? "Plan"} · ${
    BUDGET_TYPE_OPTIONS.find((t) => t.value === budget.type)?.label ??
    budget.type
  }`;

  return (
    <div className="space-y-4">
      <TitleComponent
        title={`Actividades de "${budgetLabel}"`}
        subtitle="Las actividades de este presupuesto se registran aquí."
        icon="CalendarCheck2"
        backRoute={ABSOLUTE_ROUTE!}
      >
        <Button onClick={() => setCreating(true)}>
          <Plus className="size-4 mr-2" /> Agregar Actividad
        </Button>
      </TitleComponent>

      <GeneralModal
        open={creating}
        onClose={() => setCreating(false)}
        title="Agregar Actividad"
        subtitle={budgetLabel}
        icon="CalendarCheck2"
        size="3xl"
      >
        <ActivitiesForm
          defaultValues={{
            budget_id: budgetId.toString(),
            name: "",
            activity_type: "",
            channel: "",
            responsible: "",
            start_date: "",
            end_date: "",
            currency_id: "",
            estimated_amount: 0,
            supplier_id: "",
            objective: "",
            description: "",
            notes: "",
          }}
          onSubmit={(data: ActivitiesSchema) => mutate(data)}
          isSubmitting={isPending}
          mode="create"
          budgetLabel={budgetLabel}
          hideFooter
          onCancel={() => setCreating(false)}
        />
      </GeneralModal>

      <ActivitiesTable
        isLoading={loadingActivities}
        columns={activitiesColumns({
          onDelete: setDeleteId,
          onChangeStatus: handleChangeStatus,
          permissions,
        })}
        data={activities}
      >
        <ActivitiesOptions
          search={search}
          setSearch={setSearch}
          status={status}
          setStatus={setStatus}
        />
      </ActivitiesTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
}
