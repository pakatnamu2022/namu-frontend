"use client";

import { useEffect, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import PageSkeleton from "@/shared/components/PageSkeleton";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { notFound } from "@/shared/hooks/useNotFound";
import {
  currentYear,
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { PAYROLL_EXCLUSION } from "@/features/gp/gestionhumana/planillas/exclusiones/lib/exclusion.constants";
import { useExclusions } from "@/features/gp/gestionhumana/planillas/exclusiones/lib/exclusion.hook";
import { deleteExclusion } from "@/features/gp/gestionhumana/planillas/exclusiones/lib/exclusion.actions";
import ExclusionActions from "@/features/gp/gestionhumana/planillas/exclusiones/components/ExclusionActions";
import ExclusionTable from "@/features/gp/gestionhumana/planillas/exclusiones/components/ExclusionTable";
import ExclusionOptions from "@/features/gp/gestionhumana/planillas/exclusiones/components/ExclusionOptions";
import { exclusionColumns } from "@/features/gp/gestionhumana/planillas/exclusiones/components/ExclusionColumns";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";

const { MODEL, ROUTE } = PAYROLL_EXCLUSION;

export default function ExclusionPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(String(currentYear()));
  const [companyId, setCompanyId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [concept, setConcept] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data: companies } = useAllCompanies();

  useEffect(() => {
    if (companies && companies.length > 0 && !companyId) {
      setCompanyId(String(companies[0].id));
    }
  }, [companies, companyId]);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, year, companyId, periodId, concept]);

  const { data, isLoading, refetch } = useExclusions({
    page,
    per_page,
    search,
    "period.company_id": companyId || undefined,
    ...(periodId ? { period_id: periodId } : {}),
    ...(concept ? { concept } : {}),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteExclusion(deleteId);
      await refetch();
      successToast(SUCCESS_MESSAGE(MODEL, "delete"));
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message,
        ERROR_MESSAGE(MODEL, "delete"),
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
        <ExclusionActions />
      </HeaderTableWrapper>

      <ExclusionTable
        isLoading={isLoading}
        columns={exclusionColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <ExclusionOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          companyId={companyId}
          setCompanyId={setCompanyId}
          periodId={periodId}
          setPeriodId={setPeriodId}
          concept={concept}
          setConcept={setConcept}
        />
      </ExclusionTable>

      {deleteId !== null && (
        <SimpleDeleteDialog
          open={true}
          onOpenChange={(open) => !open && setDeleteId(null)}
          onConfirm={handleDelete}
          description="Esta acción no se puede deshacer. El concepto volverá a aplicarse automáticamente para este trabajador y periodo."
        />
      )}

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page || 1}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        totalData={data?.meta?.total || 0}
      />
    </div>
  );
}
