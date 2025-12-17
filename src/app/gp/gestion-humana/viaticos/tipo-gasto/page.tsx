"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import ExpenseTypeActions from "@/features/gp/gestionhumana/viaticos/tipo-gasto/components/ExpenseTypeActions";
import ExpenseTypeTable from "@/features/gp/gestionhumana/viaticos/tipo-gasto/components/ExpenseTypeTable";
import { expenseTypeColumns } from "@/features/gp/gestionhumana/viaticos/tipo-gasto/components/ExpenseTypeColumns";
import ExpenseTypeOptions from "@/features/gp/gestionhumana/viaticos/tipo-gasto/components/ExpenseTypeOptions";
import ExpenseTypeModal from "@/features/gp/gestionhumana/viaticos/tipo-gasto/components/ExpenseTypeModal";
import { useExpenseTypes } from "@/features/gp/gestionhumana/viaticos/tipo-gasto/lib/expenseType.hook";
import {
  deleteExpenseType,
  updateExpenseType,
} from "@/features/gp/gestionhumana/viaticos/tipo-gasto/lib/expenseType.actions";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { EXPENSE_TYPE } from "@/features/gp/gestionhumana/viaticos/tipo-gasto/lib/expenseType.constants";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function ExpenseTypePage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [updateId, setUpdateId] = useState<number | null>(null);
  const { MODEL, ROUTE } = EXPENSE_TYPE;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useExpenseTypes({
    params: {
      page,
      search,
      per_page,
    },
  });

  const handleToggleStatus = async (id: number, newStatus: boolean) => {
    try {
      await updateExpenseType(id, { active: newStatus } as any);
      await refetch();
      successToast("Estado actualizado correctamente.");
    } catch {
      errorToast("Error al actualizar el estado.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExpenseType(deleteId);
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
          subtitle={"Tipos de Gastos para Viáticos"}
          icon={currentView.icon}
        />
        <ExpenseTypeActions permissions={permissions} />
      </HeaderTableWrapper>
      <ExpenseTypeTable
        isLoading={isLoading}
        columns={expenseTypeColumns({
          onToggleStatus: handleToggleStatus,
          onDelete: setDeleteId,
          onUpdate: setUpdateId,
          permissions,
        })}
        data={data?.data || []}
      >
        <ExpenseTypeOptions search={search} setSearch={setSearch} />
      </ExpenseTypeTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {updateId !== null && (
        <ExpenseTypeModal
          id={updateId}
          title={"Actualizar Tipo de Gasto"}
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
