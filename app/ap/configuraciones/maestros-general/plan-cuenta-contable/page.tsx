"use client";

import { notFound } from "next/navigation";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/src/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/src/core/core.function";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import { useAccountingAccountPlan } from "@/src/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.hook";
import {
  deleteAccountingAccountPlan,
  updateAccountingAccountPlan,
} from "@/src/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.actions";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import AccountingAccountPlanActions from "@/src/features/ap/configuraciones/maestros-general/plan-cuenta-contable/components/AccountingAccountPlanActions";
import AccountingAccountPlanTable from "@/src/features/ap/configuraciones/maestros-general/plan-cuenta-contable/components/AccountingAccountPlanTable";
import { accountingAccountPlanColumns } from "@/src/features/ap/configuraciones/maestros-general/plan-cuenta-contable/components/AccountingAccountPlanColumns";
import AccountingAccountPlanOptions from "@/src/features/ap/configuraciones/maestros-general/plan-cuenta-contable/components/AccountingAccountPlanOptions";
import AccountingAccountPlanModal from "@/src/features/ap/configuraciones/maestros-general/plan-cuenta-contable/components/AccountingAccountPlanModal";
import { ACCOUNTING_ACCOUNT_PLAN } from "@/src/features/ap/configuraciones/maestros-general/plan-cuenta-contable/lib/accountingAccountPlan.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function AccountingAccountPlanPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = ACCOUNTING_ACCOUNT_PLAN;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useAccountingAccountPlan({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateAccountingAccountPlan(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAccountingAccountPlan(deleteId);
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
          subtitle={"Plan de Cuenta Contable"}
          icon={currentView.icon}
        />
        <AccountingAccountPlanActions permissions={permissions} />
      </HeaderTableWrapper>
      <AccountingAccountPlanTable
        isLoading={isLoading}
        columns={accountingAccountPlanColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <AccountingAccountPlanOptions search={search} setSearch={setSearch} />
      </AccountingAccountPlanTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <AccountingAccountPlanModal
          id={updateId}
          title={"Actualizar Plan de Cuenta Contable"}
          open={true}
          onClose={() => {
            setUpdateId(null);
          }}
          mode="update"
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
