"use client";

import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useState } from "react";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { COMPANY } from "@/features/gp/maestro-general/empresa/lib/company.constants";
import { useCompanys } from "@/features/gp/maestro-general/empresa/lib/company.hook";
import CompanyTable from "@/features/gp/maestro-general/empresa/components/CompanyTable";
import CompanyOptions from "@/features/gp/maestro-general/empresa/components/CompanyOptions";
import { companyColumns } from "@/features/gp/maestro-general/empresa/components/CompanyColumns";
import { notFound } from "@/shared/hooks/useNotFound";

export default function CompanyPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const { ROUTE } = COMPANY;

  const { data, isLoading } = useCompanys({
    page,
    search,
    per_page,
  });

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
      </HeaderTableWrapper>
      <CompanyTable
        isLoading={isLoading}
        columns={companyColumns()}
        data={data?.data || []}
      >
        <CompanyOptions search={search} setSearch={setSearch} />
      </CompanyTable>

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
