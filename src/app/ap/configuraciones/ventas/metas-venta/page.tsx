"use client";

import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE, MONTHS } from "@/core/core.constants";
import { generateYear } from "@/core/core.function";
import { AP_GOAL_SELL_OUT_IN } from "@/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.constants";
import { useApGoalSellOutIn } from "@/features/ap/configuraciones/ventas/metas-venta/lib/apGoalSellOutIn.hook";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import ApGoalSellOutInActions from "@/features/ap/configuraciones/ventas/metas-venta/components/ApGoalSellOutInActions";
import ApGoalSellOutInTable from "@/features/ap/configuraciones/ventas/metas-venta/components/ApGoalSellOutInTable";
import { apGoalSellOutInColumns } from "@/features/ap/configuraciones/ventas/metas-venta/components/ApGoalSellOutInColumns";
import ApGoalSellOutInOptions from "@/features/ap/configuraciones/ventas/metas-venta/components/ApGoalSellOutInOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import NotFound from '@/app/not-found';


export default function ApGoalSellOutInPage() {
    const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const currentYear = new Date().getFullYear().toString();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth);
  const { ROUTE } = AP_GOAL_SELL_OUT_IN;
  const permissions = useModulePermissions(ROUTE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  const { data, isLoading } = useApGoalSellOutIn({
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
        <ApGoalSellOutInActions
          year={year}
          month={month}
          permissions={permissions}
        />
      </HeaderTableWrapper>
      <ApGoalSellOutInTable
        isLoading={isLoading}
        columns={apGoalSellOutInColumns()}
        data={data?.data || []}
      >
        <ApGoalSellOutInOptions
          search={search}
          setSearch={setSearch}
          year={year}
          setYear={setYear}
          years={generateYear()}
          month={month}
          setMonth={setMonth}
          months={MONTHS}
        />
      </ApGoalSellOutInTable>

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
