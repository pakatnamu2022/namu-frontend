"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { usePayrollPeriods } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.hook";
import PayrollPeriodActions from "@/features/gp/gestionhumana/planillas/periodo-planilla/components/PayrollPeriodActions";
import PayrollPeriodModal from "@/features/gp/gestionhumana/planillas/periodo-planilla/components/PayrollPeriodModal";
import PayrollPeriodTable from "@/features/gp/gestionhumana/planillas/periodo-planilla/components/PayrollPeriodTable";
import { payrollPeriodColumns } from "@/features/gp/gestionhumana/planillas/periodo-planilla/components/PayrollPeriodColumns";
import PayrollPeriodOptions from "@/features/gp/gestionhumana/planillas/periodo-planilla/components/PayrollPeriodOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import {
  closePayrollPeriod,
  deletePayrollPeriod,
} from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PAYROLL_PERIOD } from "@/features/gp/gestionhumana/planillas/periodo-planilla/lib/payroll-period.constant";
import { SimpleConfirmDialog } from "@/shared/components/SimpleConfirmDialog";

export default function PayrollPeriodsPage() {
  const { MODEL, ROUTE } = PAYROLL_PERIOD;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [closeId, setCloseId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = usePayrollPeriods({
    page,
    per_page,
    search,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePayrollPeriod(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "delete")
      );
    } finally {
      setDeleteId(null);
    }
  };

  const handleClose = async () => {
    if (!closeId) return;
    try {
      await closePayrollPeriod(closeId);
      await refetch();
      successToast("Periodo cerrado correctamente");
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "Error al cerrar el periodo"
      );
    } finally {
      setCloseId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) return <div>No hay</div>;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <PayrollPeriodActions onAdd={() => setCreateOpen(true)} />
      </HeaderTableWrapper>

      <PayrollPeriodTable
        isLoading={isLoading}
        columns={payrollPeriodColumns({
          onDelete: setDeleteId,
          onClose: setCloseId,
          onEdit: setEditId,
        })}
        data={data?.data || []}
      >
        <PayrollPeriodOptions search={search} setSearch={setSearch} />
      </PayrollPeriodTable>

      <PayrollPeriodModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
      />

      {editId !== null && (
        <PayrollPeriodModal
          open={true}
          onClose={() => setEditId(null)}
          id={editId}
          mode="update"
        />
      )}

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {closeId !== null && (
        <SimpleConfirmDialog
          open={true}
          onOpenChange={(open) => !open && setCloseId(null)}
          onConfirm={handleClose}
          title="Cerrar Periodo"
          description="¿Estás seguro de que deseas cerrar este periodo? Esta acción no se puede deshacer."
          confirmText="Cerrar"
          cancelText="Cancelar"
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
