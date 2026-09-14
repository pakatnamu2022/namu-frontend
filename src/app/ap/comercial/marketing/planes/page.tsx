"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { PLANS } from "@/features/ap/comercial/marketing/planes/lib/plans.constants";
import { usePlans } from "@/features/ap/comercial/marketing/planes/lib/plans.hook";
import {
  activatePlan,
  cancelPlan,
  completePlan,
  deletePlans,
} from "@/features/ap/comercial/marketing/planes/lib/plans.actions";
import PlansActions from "@/features/ap/comercial/marketing/planes/components/PlansActions";
import PlansTable from "@/features/ap/comercial/marketing/planes/components/PlansTable";
import { plansColumns } from "@/features/ap/comercial/marketing/planes/components/PlansColumns";
import PlansOptions from "@/features/ap/comercial/marketing/planes/components/PlansOptions";
import PlanBudgetsModal from "@/features/ap/comercial/marketing/planes/components/PlanBudgetsModal";
import { PlansResource } from "@/features/ap/comercial/marketing/planes/lib/plans.interface";
import { MARKETING_PURCHASE_ORDERS } from "@/features/ap/comercial/marketing/ordenes-compra/lib/purchaseOrders.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

type PlanAction = { id: number; kind: "activate" | "complete" | "cancel" } | null;

const ACTION_COPY: Record<
  "activate" | "complete" | "cancel",
  { title: string; description: string; confirmText: string; icon: "warning" | "danger" | "success" }
> = {
  activate: {
    title: "¿Activar este plan?",
    description: "El plan pasará de Borrador a Activo.",
    confirmText: "Activar",
    icon: "success",
  },
  complete: {
    title: "¿Completar este plan?",
    description: "El plan pasará a Cerrado y se abrirá la creación de la Orden de Compra con el concepto del plan.",
    confirmText: "Completar",
    icon: "success",
  },
  cancel: {
    title: "¿Cancelar este plan?",
    description: "El plan pasará a Cancelado y no podrá reactivarse.",
    confirmText: "Cancelar plan",
    icon: "danger",
  },
};

export default function MarketingPlansPage() {
  const router = useNavigate();
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [budgetsPlan, setBudgetsPlan] = useState<PlansResource | null>(null);
  const [pendingAction, setPendingAction] = useState<PlanAction>(null);
  const [isActionPending, setIsActionPending] = useState(false);
  const { MODEL, ROUTE } = PLANS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = usePlans({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePlans(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    const { id, kind } = pendingAction;
    setIsActionPending(true);
    try {
      const fn = kind === "activate" ? activatePlan : kind === "complete" ? completePlan : cancelPlan;
      await fn(id);
      await refetch();
      successToast("Plan actualizado correctamente");
      if (kind === "complete") {
        router(`${MARKETING_PURCHASE_ORDERS.ROUTE_ADD}?plan_id=${id}`);
        return;
      }
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "update", msg));
    } finally {
      setIsActionPending(false);
      setPendingAction(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <PlansActions permissions={permissions} />
      </HeaderTableWrapper>
      <PlansTable
        isLoading={isLoading}
        columns={plansColumns({
          onDelete: setDeleteId,
          onActivate: (id) => setPendingAction({ id, kind: "activate" }),
          onComplete: (id) => setPendingAction({ id, kind: "complete" }),
          onCancel: (id) => setPendingAction({ id, kind: "cancel" }),
          onManageBudgets: setBudgetsPlan,
          permissions,
        })}
        data={data?.data || []}
      >
        <PlansOptions search={search} setSearch={setSearch} />
      </PlansTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <PlanBudgetsModal plan={budgetsPlan} onOpenChange={(open) => !open && setBudgetsPlan(null)} />

      {pendingAction && (
        <SimpleConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setPendingAction(null)}
          onConfirm={handleConfirmAction}
          isLoading={isActionPending}
          title={ACTION_COPY[pendingAction.kind].title}
          description={ACTION_COPY[pendingAction.kind].description}
          confirmText={ACTION_COPY[pendingAction.kind].confirmText}
          icon={ACTION_COPY[pendingAction.kind].icon}
          variant={pendingAction.kind === "cancel" ? "destructive" : "default"}
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        totalData={data?.meta?.total || 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />
    </div>
  );
}
