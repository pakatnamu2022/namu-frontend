"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useBonuses } from "@/features/gp/gestionhumana/planillas/bonuses/lib/bonus.hook";
import BonusTable from "@/features/gp/gestionhumana/planillas/bonuses/components/BonusTable";
import { bonusColumns } from "@/features/gp/gestionhumana/planillas/bonuses/components/BonusColumns";
import BonusOptions from "@/features/gp/gestionhumana/planillas/bonuses/components/BonusOptions";
import BonusActions from "@/features/gp/gestionhumana/planillas/bonuses/components/BonusActions";
import { SimpleDeleteDialog } from "@/shared/components/SimpleDeleteDialog";
import { deleteBonus } from "@/features/gp/gestionhumana/planillas/bonuses/lib/bonus.actions";
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
import { BONUS } from "@/features/gp/gestionhumana/planillas/bonuses/lib/bonus.constant";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";

export default function BonusPage() {
  const { MODEL, ROUTE } = BONUS;
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

  const { data, isLoading, refetch } = useBonuses({
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
      await deleteBonus(deleteId);
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
        <BonusActions />
      </HeaderTableWrapper>

      <BonusTable
        isLoading={isLoading}
        columns={bonusColumns({ onDelete: setDeleteId })}
        data={data?.data || []}
      >
        <BonusOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          companyId={companyId}
          setCompanyId={setCompanyId}
          periodId={periodId}
          setPeriodId={setPeriodId}
        />
      </BonusTable>

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
