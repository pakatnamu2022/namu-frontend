"use client";

import { useScopedFilters } from "@/shared/hooks/useScopedFilters";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { getCurrentDayOfMonth, getFirstDayOfMonth } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { INTERNAL_NOTE_MIGRATION } from "@/features/ap/post-venta/taller/notas-internas/lib/internalNoteMigration.constants";
import { useGetInternalNoteMigration } from "@/features/ap/post-venta/taller/notas-internas/lib/internalNoteMigration.hook";
import InternalNoteMigrationTable from "@/features/ap/post-venta/taller/notas-internas/components/InternalNoteMigrationTable";
import { internalNoteMigrationColumns } from "@/features/ap/post-venta/taller/notas-internas/components/InternalNoteMigrationColumns";
import InternalNoteMigrationOptions from "@/features/ap/post-venta/taller/notas-internas/components/InternalNoteMigrationOptions";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { WORKER_ORDER } from "@/features/ap/post-venta/taller/orden-trabajo/lib/workOrder.constants";

export default function InternalNoteMigrationPage() {
  const router = useNavigate();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const { ABSOLUTE_ROUTE } = INTERNAL_NOTE_MIGRATION;
  const permissions = useModulePermissions(WORKER_ORDER.ROUTE);
  const currentDate = new Date();

  const { values: filters, setFieldValue: setFilter } = useScopedFilters(
    ABSOLUTE_ROUTE,
    {
      search: "",
      dateFrom: getFirstDayOfMonth(currentDate) as Date | undefined,
      dateTo: getCurrentDayOfMonth(currentDate) as Date | undefined,
    },
  );
  const { search, dateFrom, dateTo } = filters;
  const setSearch = (value: string) => setFilter("search", value);
  const setDateFrom = (value: Date | undefined) => setFilter("dateFrom", value);
  const setDateTo = (value: Date | undefined) => setFilter("dateTo", value);

  const formatDate = (date: Date | undefined) => {
    return date ? date.toLocaleDateString("en-CA") : undefined; // formato: YYYY-MM-DD
  };

  const { data, isLoading } = useGetInternalNoteMigration({
    params: {
      page,
      search,
      per_page,
      created_date:
        dateFrom && dateTo
          ? [formatDate(dateFrom), formatDate(dateTo)]
          : undefined,
    },
  });

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Migraciones de Notas Internas"
          subtitle="Notas Internas Sin Comprobante"
          icon="StickyNote"
          onBack={() => router(WORKER_ORDER.ABSOLUTE_ROUTE)}
        />
      </HeaderTableWrapper>

      <InternalNoteMigrationTable
        isLoading={isLoading}
        columns={internalNoteMigrationColumns({
          permissions: {
            canVerifyMigration: permissions.canMigrate,
          },
        })}
        data={data?.data || []}
      >
        <InternalNoteMigrationOptions
          search={search}
          setSearch={setSearch}
          dateFrom={dateFrom}
          setDateFrom={setDateFrom}
          dateTo={dateTo}
          setDateTo={setDateTo}
        />
      </InternalNoteMigrationTable>

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
