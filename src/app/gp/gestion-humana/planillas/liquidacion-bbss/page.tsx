"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useLiquidacionesBbss } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.hook";
import LiquidacionBbssTable from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/components/LiquidacionBbssTable";
import { liquidacionBbssColumns } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/components/LiquidacionBbssColumns";
import LiquidacionBbssOptions from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/components/LiquidacionBbssOptions";
import LiquidacionBbssActions from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/components/LiquidacionBbssActions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteLiquidacionBbss } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.actions";
import {
  ERROR_MESSAGE,
  errorToast,
  SUCCESS_MESSAGE,
  successToast,
  currentYear,
} from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { LIQUIDACION_BBSS } from "@/features/gp/gestionhumana/planillas/liquidacion-bbss/lib/liquidacion-bbss.constant";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";

export default function LiquidacionBbssPage() {
  const { MODEL, ROUTE } = LIQUIDACION_BBSS;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [year, setYear] = useState(String(currentYear()));
  const [companyId, setCompanyId] = useState("");
  const [periodId, setPeriodId] = useState("");

  const { data: companies } = useAllCompanies();

  useEffect(() => {
    if (companies && companies.length > 0 && !companyId) {
      setCompanyId(String(companies[0].id));
    }
  }, [companies, companyId]);

  useEffect(() => {
    setPage(1);
  }, [search, per_page, year, companyId, periodId]);

  const { data, isLoading, refetch } = useLiquidacionesBbss({
    page,
    per_page,
    search,
    year,
    company_id: companyId,
    ...(periodId ? { period_id: periodId } : {}),
  });

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLiquidacionBbss(deleteId);
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
        <LiquidacionBbssActions />
      </HeaderTableWrapper>

      <LiquidacionBbssTable
        isLoading={isLoading}
        columns={liquidacionBbssColumns({
          onDelete: setDeleteId,
        })}
        data={data?.data || []}
      >
        <LiquidacionBbssOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          companyId={companyId}
          setCompanyId={setCompanyId}
          periodId={periodId}
          setPeriodId={setPeriodId}
        />
      </LiquidacionBbssTable>

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
