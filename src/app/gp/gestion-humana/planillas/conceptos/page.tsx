"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { usePayrollConcepts } from "@/features/gp/gestionhumana/planillas/conceptos/lib/payroll-concept.hook";
import PayrollConceptActions from "@/features/gp/gestionhumana/planillas/conceptos/components/PayrollConceptActions";
import PayrollConceptTable from "@/features/gp/gestionhumana/planillas/conceptos/components/PayrollConceptTable";
import { payrollConceptColumns } from "@/features/gp/gestionhumana/planillas/conceptos/components/PayrollConceptColumns";
import PayrollConceptOptions from "@/features/gp/gestionhumana/planillas/conceptos/components/PayrollConceptOptions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deletePayrollConcept } from "@/features/gp/gestionhumana/planillas/conceptos/lib/payroll-concept.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { PAYROLL_CONCEPT } from "@/features/gp/gestionhumana/planillas/conceptos/lib/payroll-concept.constant";

export default function PayrollConceptsPage() {
  const { MODEL } = PAYROLL_CONCEPT;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);

  const { data, isLoading, refetch } = usePayrollConcepts({
    page,
    per_page,
    search,
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePayrollConcept(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      errorToast(err?.response?.data?.message ?? ERROR_MESSAGE(MODEL, "delete"));
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists("conceptos")) notFound();
  if (!currentView) return <div>No hay vista disponible</div>;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <PayrollConceptActions />
      </HeaderTableWrapper>

      <PayrollConceptTable
        isLoading={isLoading}
        columns={payrollConceptColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <PayrollConceptOptions search={search} setSearch={setSearch} />
      </PayrollConceptTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
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
