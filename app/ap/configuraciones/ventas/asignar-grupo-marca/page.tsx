"use client";

import { notFound } from "next/navigation";
import { DEFAULT_PER_PAGE, MONTHS } from "@/src/core/core.constants";
import { COMMERCIAL_MANAGER_BRAND_GROUP } from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.constants";
import { useCommercialManagerBrandGroup } from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/lib/commercialManagerBrandGroup.hook";
import { POSITION_TYPE } from "@/src/features/gp/gestionhumana/personal/posiciones/lib/position.constant";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useEffect, useState } from "react";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import TitleComponent from "@/src/shared/components/TitleComponent";
import CommercialManagerBrandGroupActions from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupActions";
import CommercialManagerBrandGroupTable from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupTable";
import { commercialManagerBrandGroupColumns } from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupColumns";
import CommercialManagerBrandGroupOptions from "@/src/features/ap/configuraciones/ventas/asignar-grupo-marca/components/CommercialManagerBrandGroupOptions";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { generateYear } from "@/src/core/core.function";
import { useModulePermissions } from "@/src/shared/hooks/useModulePermissions";

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
        columns={commercialManagerBrandGroupColumns()}
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
