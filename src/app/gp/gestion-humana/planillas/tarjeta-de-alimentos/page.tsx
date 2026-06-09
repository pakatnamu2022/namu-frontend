"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useFoodCards } from "@/features/gp/gestionhumana/planillas/food-cards/lib/food-card.hook";
import FoodCardTable from "@/features/gp/gestionhumana/planillas/food-cards/components/FoodCardTable";
import { foodCardColumns } from "@/features/gp/gestionhumana/planillas/food-cards/components/FoodCardColumns";
import FoodCardOptions from "@/features/gp/gestionhumana/planillas/food-cards/components/FoodCardOptions";
import FoodCardActions from "@/features/gp/gestionhumana/planillas/food-cards/components/FoodCardActions";
import { currentYear } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { FOOD_CARD } from "@/features/gp/gestionhumana/planillas/food-cards/lib/food-card.constant";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";

export default function FoodCardPage() {
  const { ROUTE } = FOOD_CARD;
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");

  const [year, setYear] = useState(String(currentYear()));
  const [companyId, setCompanyId] = useState("");
  const [periodId, setPeriodId] = useState("");

  const { data: companies } = useAllCompanies();

  useEffect(() => {
    if (companies && companies.length > 0 && !companyId) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCompanyId(String(companies[0].id));
    }
  }, [companies, companyId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPage(1);
  }, [search, per_page, year, companyId, periodId]);

  const { data, isLoading } = useFoodCards({
    page,
    per_page,
    search,
    year,
    company_id: companyId,
    ...(periodId ? { period_id: periodId } : {}),
  });

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
        <FoodCardActions />
      </HeaderTableWrapper>

      <FoodCardTable
        isLoading={isLoading}
        columns={foodCardColumns()}
        data={data?.data || []}
      >
        <FoodCardOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          companyId={companyId}
          setCompanyId={setCompanyId}
          periodId={periodId}
          setPeriodId={setPeriodId}
        />
      </FoodCardTable>

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
