"use client";

import { notFound } from "next/navigation";
import PageSkeleton from "@/src/shared/components/PageSkeleton";
import { useCurrentModule } from "@/src/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/src/shared/components/TitleComponent";
import DataTablePagination from "@/src/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/src/core/core.constants";
import HeaderTableWrapper from "@/src/shared/components/HeaderTableWrapper";
import { AUDIT_LOGS } from "@/src/features/gp/tics/auditoria/lib/auditLogs.constants";
import { useAuditLogs } from "@/src/features/gp/tics/auditoria/lib/auditLogs.hook";
import AuditLogsActions from "@/src/features/gp/tics/auditoria/components/AuditLogsActions";
import AuditLogsTable from "@/src/features/gp/tics/auditoria/components/AuditLogsTable";
import { auditLogsColumns } from "@/src/features/gp/tics/auditoria/components/AuditLogsColumns";
import AuditLogsOptions from "@/src/features/gp/tics/auditoria/components/AuditLogsOptions";

export default function AuditLogsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const { ROUTE } = AUDIT_LOGS;

  useEffect(() => {
    setPage(1);
  }, [search, per_page]);
  const { data, isLoading } = useAuditLogs({
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
          subtitle={"Categorias de Vehículos"}
          icon={currentView.icon}
        />
        <AuditLogsActions />
      </HeaderTableWrapper>
      <AuditLogsTable
        isLoading={isLoading}
        columns={auditLogsColumns()}
        data={data?.data || []}
      >
        <AuditLogsOptions search={search} setSearch={setSearch} />
      </AuditLogsTable>

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
