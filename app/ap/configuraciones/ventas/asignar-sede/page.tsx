"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE, MONTHS } from "@/core/core.constants";
import { useAssignCompanyBranch } from "@/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.hook";
import AssignCompanyBranchTable from "@/features/ap/configuraciones/ventas/asignar-sede/components/AssignCompanyBranchTable";
import AssignCompanyBranchOptions from "@/features/ap/configuraciones/ventas/asignar-sede/components/AssignCompanyBranchOptions";
import { assignCompanyBranchColumns } from "@/features/ap/configuraciones/ventas/asignar-sede/components/AssignCompanyBranchColumns";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import AssignCompanyBranchActions from "@/features/ap/configuraciones/ventas/asignar-sede/components/AssignCompanyBranchActions";
import { ASSIGN_COMPANY_BRANCH } from "@/features/ap/configuraciones/ventas/asignar-sede/lib/assignCompanyBranch.constants";
import { generateYear } from "@/core/core.function";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function AssignCompanyBranchPage() {
  
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const { ROUTE } = ASSIGN_COMPANY_BRANCH;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading } = useAssignCompanyBranch({
    page,
    search,
    per_page,
    year,
    month,
  });

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) return <NotFound />;
  if (!currentView) return <NotFound />;

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title={currentView.descripcion}
          subtitle={currentView.descripcion}
          icon={currentView.icon}
        />
        <AssignCompanyBranchActions permissions={permissions} />
      </HeaderTableWrapper>
      <AssignCompanyBranchTable
        isLoading={isLoading}
        columns={assignCompanyBranchColumns({ permissions })}
        data={data?.data || []}
      >
        <AssignCompanyBranchOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          years={generateYear()}
          month={month}
          setMonth={setMonth}
          months={MONTHS}
        />
      </AssignCompanyBranchTable>

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
