"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { BUDGETS } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.constants";
import { useBudgets } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.hook";
import { deleteBudgets } from "@/features/ap/comercial/marketing/presupuestos/lib/budgets.actions";
import BudgetsActions from "@/features/ap/comercial/marketing/presupuestos/components/BudgetsActions";
import BudgetsTable from "@/features/ap/comercial/marketing/presupuestos/components/BudgetsTable";
import { budgetsColumns } from "@/features/ap/comercial/marketing/presupuestos/components/BudgetsColumns";
import BudgetsOptions from "@/features/ap/comercial/marketing/presupuestos/components/BudgetsOptions";
import FundingModal from "@/features/ap/comercial/marketing/presupuestos/components/FundingModal";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function MarketingBudgetsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [fundingBudgetId, setFundingBudgetId] = useState<number | null>(null);
  const { MODEL, ROUTE } = BUDGETS;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useBudgets({ page, search, per_page });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteBudgets(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error?.response?.data?.message || "";
      errorToast(ERROR_MESSAGE(MODEL, "delete", msg));
    } finally {
      setDeleteId(null);
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
        <BudgetsActions permissions={permissions} />
      </HeaderTableWrapper>
      <BudgetsTable
        isLoading={isLoading}
        columns={budgetsColumns({
          onDelete: setDeleteId,
          onAddFunding: setFundingBudgetId,
          permissions,
        })}
        data={data?.data || []}
      >
        <BudgetsOptions search={search} setSearch={setSearch} />
      </BudgetsTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      <FundingModal
        budgetId={fundingBudgetId}
        onOpenChange={(open) => !open && setFundingBudgetId(null)}
        onSuccess={async () => {
          setFundingBudgetId(null);
          await refetch();
        }}
      />

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
