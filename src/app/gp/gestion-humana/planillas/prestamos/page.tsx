"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useLoans } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.hook";
import LoanTable from "@/features/gp/gestionhumana/planillas/loans/components/LoanTable";
import { loanColumns } from "@/features/gp/gestionhumana/planillas/loans/components/LoanColumns";
import LoanOptions from "@/features/gp/gestionhumana/planillas/loans/components/LoanOptions";
import LoanActions from "@/features/gp/gestionhumana/planillas/loans/components/LoanActions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteLoan } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.actions";
import { LoanAmortizeDialog } from "@/features/gp/gestionhumana/planillas/loans/components/LoanAmortizeDialog";
import { LoanDetailDialog } from "@/features/gp/gestionhumana/planillas/loans/components/LoanDetailDialog";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { LOAN } from "@/features/gp/gestionhumana/planillas/loans/lib/loan.constant";

export default function LoanPage() {
  const { MODEL, ROUTE } = LOAN;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [amortizeId, setAmortizeId] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = useLoans({ page, per_page, search });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLoan(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "delete"),
      );
    } finally {
      setDeleteId(null);
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
        <LoanActions />
      </HeaderTableWrapper>

      <LoanTable
        isLoading={isLoading}
        columns={loanColumns({
          onDelete: setDeleteId,
          onAmortize: setAmortizeId,
          onDetail: setDetailId,
        })}
        data={data?.data || []}
      >
        <LoanOptions search={search} setSearch={setSearch} />
      </LoanTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
        />
      )}

      {detailId !== null && (
        <LoanDetailDialog
          loanId={detailId}
          open={true}
          onOpenChange={(open) => !open && setDetailId(null)}
        />
      )}

      {amortizeId !== null && (
        <LoanAmortizeDialog
          loanId={amortizeId}
          open={true}
          onOpenChange={(open) => !open && setAmortizeId(null)}
          onSuccess={refetch}
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
