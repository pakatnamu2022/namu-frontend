"use client";

import PageSkeleton from "@/shared/components/PageSkeleton";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import { useEffect, useState } from "react";
import TitleComponent from "@/shared/components/TitleComponent";
import DataTablePagination from "@/shared/components/DataTablePagination";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { AUDIT_LOGS } from "@/features/gp/tics/auditoria/lib/auditLogs.constants";
import { useAuditLogs } from "@/features/gp/tics/auditoria/lib/auditLogs.hook";
import AuditLogsActions from "@/features/gp/tics/auditoria/components/AuditLogsActions";
import AuditLogsTable from "@/features/gp/tics/auditoria/components/AuditLogsTable";
import { auditLogsColumns } from "@/features/gp/tics/auditoria/components/AuditLogsColumns";
import AuditLogsOptions from "@/features/gp/tics/auditoria/components/AuditLogsOptions";
import AuditChangesModal from "@/features/gp/tics/auditoria/components/AuditChangesModal";
import { AuditLogsResource } from "@/features/gp/tics/auditoria/lib/auditLogs.interface";
import { notFound } from "@/shared/hooks/useNotFound";

export default function AuditLogsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [selectedAudit, setSelectedAudit] = useState<AuditLogsResource | null>(
    null,
  );
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
        columns={auditLogsColumns({ onViewChanges: setSelectedAudit })}
        data={data?.data || []}
      >
        <AuditLogsOptions search={search} setSearch={setSearch} />
      </AuditLogsTable>

      {selectedAudit && (
        <AuditChangesModal
          open={true}
          onClose={() => setSelectedAudit(null)}
          audit={selectedAudit}
        />
      )}

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
