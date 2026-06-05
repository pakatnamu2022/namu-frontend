"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useFamilyAllowances } from "@/features/gp/gestionhumana/planillas/family-allowances/lib/family-allowance.hook";
import FamilyAllowanceTable from "@/features/gp/gestionhumana/planillas/family-allowances/components/FamilyAllowanceTable";
import { familyAllowanceColumns } from "@/features/gp/gestionhumana/planillas/family-allowances/components/FamilyAllowanceColumns";
import FamilyAllowanceOptions from "@/features/gp/gestionhumana/planillas/family-allowances/components/FamilyAllowanceOptions";
import FamilyAllowanceActions from "@/features/gp/gestionhumana/planillas/family-allowances/components/FamilyAllowanceActions";
import { currentYear } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { FAMILY_ALLOWANCE } from "@/features/gp/gestionhumana/planillas/family-allowances/lib/family-allowance.constant";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";

export default function FamilyAllowancePage() {
  const { ROUTE } = FAMILY_ALLOWANCE;
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

  const { data, isLoading } = useFamilyAllowances({
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
        <FamilyAllowanceActions />
      </HeaderTableWrapper>

      <FamilyAllowanceTable
        isLoading={isLoading}
        columns={familyAllowanceColumns()}
        data={data?.data || []}
      >
        <FamilyAllowanceOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          companyId={companyId}
          setCompanyId={setCompanyId}
          periodId={periodId}
          setPeriodId={setPeriodId}
        />
      </FamilyAllowanceTable>

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
