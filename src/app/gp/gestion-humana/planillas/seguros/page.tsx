"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useInsurances } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.hook";
import InsuranceTable from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceTable";
import { insuranceColumns } from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceColumns";
import InsuranceOptions from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceOptions";
import InsuranceActions from "@/features/gp/gestionhumana/planillas/insurances/components/InsuranceActions";
import { currentYear } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { notFound } from "@/shared/hooks/useNotFound";
import { INSURANCE } from "@/features/gp/gestionhumana/planillas/insurances/lib/insurance.constant";
import { useAllCompanies } from "@/features/gp/maestro-general/empresa/lib/company.hook";

export default function InsurancePage() {
  const { ROUTE } = INSURANCE;
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

  const { data, isLoading } = useInsurances({
    page,
    per_page,
    search,
    year,
    period$company_id: companyId,
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
        <InsuranceActions
          companyId={companyId}
          companyName={companies?.find((c) => String(c.id) === companyId)?.name}
        />
      </HeaderTableWrapper>

      <InsuranceTable
        isLoading={isLoading}
        columns={insuranceColumns()}
        data={data?.data || []}
      >
        <InsuranceOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          companyId={companyId}
          setCompanyId={setCompanyId}
          periodId={periodId}
          setPeriodId={setPeriodId}
        />
      </InsuranceTable>

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
