"use client";

import { DEFAULT_PER_PAGE, MONTHS } from "@/core/core.constants";
import { COMMERCIAL_MANAGER_BRAND_GROUP } from "@/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.constants";
import { useCommercialManagerBrandGroup } from "@/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.hook";
import { POSITION_TYPE } from "@/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import { useEffect, useState } from "react";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import TitleComponent from "@/shared/components/TitleComponent";
import CommercialManagerBrandGroupActions from "@/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupActions";
import CommercialManagerBrandGroupTable from "@/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupTable";
import { commercialManagerBrandGroupColumns } from "@/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupColumns";
import CommercialManagerBrandGroupOptions from "@/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupOptions";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { generateYear } from "@/core/core.function";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { notFound } from "@/shared/hooks/useNotFound";

export default function CommercialManagerBrandGroupPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const { ROUTE } = COMMERCIAL_MANAGER_BRAND_GROUP;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading } = useCommercialManagerBrandGroup({
    page,
    search,
    per_page,
    cargo_id: POSITION_TYPE.GENERAL_MANAGER,
    year,
    month,
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
        <CommercialManagerBrandGroupActions permissions={permissions} />
      </HeaderTableWrapper>
      <CommercialManagerBrandGroupTable
        isLoading={isLoading}
        columns={commercialManagerBrandGroupColumns({
          month,
          year,
        })}
        data={data?.data || []}
      >
        <CommercialManagerBrandGroupOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          years={generateYear()}
          month={month}
          setMonth={setMonth}
          months={MONTHS}
        />
      </CommercialManagerBrandGroupTable>

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
