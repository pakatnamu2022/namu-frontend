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
import { useAccountingAccountType } from "@/src/features/ap/configuraciones/maestros-general/tipos-cuenta-contable/lib/accountingAccountType.hook";
import {
  deleteAccountingAccountType,
  updateAccountingAccountType,
} from "@/src/features/ap/configuraciones/maestros-general/tipos-cuenta-contable/lib/accountingAccountType.actions";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import AccountingAccountTypeActions from "@/src/features/ap/configuraciones/maestros-general/tipos-cuenta-contable/components/AccountingAccountTypeActions";
import AccountingAccountTypeTable from "@/src/features/ap/configuraciones/maestros-general/tipos-cuenta-contable/components/AccountingAccountTypeTable";
import { accountingAccountTypeColumns } from "@/src/features/ap/configuraciones/maestros-general/tipos-cuenta-contable/components/AccountingAccountTypeColumns";
import AccountingAccountTypeOptions from "@/src/features/ap/configuraciones/maestros-general/tipos-cuenta-contable/components/AccountingAccountTypeOptions";
import AccountingAccountTypeModal from "@/src/features/ap/configuraciones/maestros-general/tipos-cuenta-contable/components/AccountingAccountTypeModal";
import { ACCOUNTING_ACCOUNT_TYPE } from "@/src/features/ap/configuraciones/maestros-general/tipos-cuenta-contable/lib/accountingAccountType.constants";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

export default function AccountingAccountTypePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { ROUTE, MODEL } = ACCOUNTING_ACCOUNT_TYPE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading, refetch } = useAccountingAccountType({
    page,
    search,
    per_page,
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateAccountingAccountType(id, { status: newStatus });
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteAccountingAccountType(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      const msg = error.response?.data?.message || "";
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
          subtitle={"Tipos de cuentas contables"}
          icon={currentView.icon}
        />
        <AccountingAccountTypeActions permissions={permissions} />
      </HeaderTableWrapper>
      <AccountingAccountTypeTable
        isLoading={isLoading}
        columns={accountingAccountTypeColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <AccountingAccountTypeOptions search={search} setSearch={setSearch} />
      </AccountingAccountTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <AccountingAccountTypeModal
          id={updateId}
          title={"Actualizar Tipo Cuenta Contable"}
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
