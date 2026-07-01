"use client";

import { useEffect, useState } from "react";
import { useCurrentModule } from "@/shared/hooks/useCurrentModule";
import PageSkeleton from "@/shared/components/PageSkeleton";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import DataTablePagination from "@/shared/components/DataTablePagination";
import FilterWrapper from "@/shared/components/FilterWrapper";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { DataTable } from "@/shared/components/DataTable";
import { notFound } from "@/shared/hooks/useNotFound";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { errorToast, successToast } from "@/core/core.function";
import { useModelVnSyncLogs } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.hook";
import { syncModelVn } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.actions";
import { modelVnSyncLogsColumns } from "@/features/ap/configuraciones/vehiculos/modelos-vn/components/ModelVnSyncLogsColumns";
import ModelVnDynamicsPayloadSheet from "@/features/ap/configuraciones/vehiculos/modelos-vn/components/ModelVnDynamicsPayloadSheet";
import type { ModelVnSyncLog, SyncStatus } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.interface";
import { MODELS_VN } from "@/features/ap/configuraciones/vehiculos/modelos-vn/lib/modelsVn.constanst";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En proceso" },
  { value: "completed", label: "Completado" },
  { value: "failed", label: "Fallido" },
];

const ROUTE = "modelos-vn";

export default function ModelVnDynamicsPage() {
  const { checkRouteExists, isLoadingModule, currentView } = useCurrentModule();
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [payloadLog, setPayloadLog] = useState<ModelVnSyncLog | null>(null);
  const [retryingId, setRetryingId] = useState<number | null>(null);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, per_page]);

  const { data, isLoading, refetch } = useModelVnSyncLogs({
    page,
    per_page,
    ...(search ? { code: search } : {}),
    ...(statusFilter ? { status: statusFilter as SyncStatus } : {}),
  });

  const handleRetry = async (log: ModelVnSyncLog) => {
    setRetryingId(log.id);
    try {
      await syncModelVn(log.model_vn_id);
      successToast(`Sincronización iniciada para ${log.code}.`);
      await refetch();
    } catch (error: any) {
      const msg =
        error?.response?.data?.message || "Error al iniciar la sincronización.";
      errorToast(msg);
    } finally {
      setRetryingId(null);
    }
  };

  if (isLoadingModule) return <PageSkeleton />;
  if (!checkRouteExists(ROUTE)) notFound();
  if (!currentView) notFound();

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Artículos Dynamics"
          subtitle="Trazabilidad de sincronización de modelos VN a Dynamics"
          icon="RefreshCw"
        />
      </HeaderTableWrapper>

      <div className="border-none text-muted-foreground max-w-full">
        <DataTable
          columns={modelVnSyncLogsColumns({
            onViewPayload: setPayloadLog,
            onRetry: handleRetry,
            retryingId,
          })}
          data={data?.data ?? []}
          isLoading={isLoading}
        >
          <FilterWrapper>
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar por código..."
            />
            <SearchableSelect
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filtrar por estado"
              className="min-w-52"
              classNameOption="text-xs"
            />
          </FilterWrapper>
        </DataTable>
      </div>

      <DataTablePagination
        page={page}
        totalPages={data?.meta?.last_page ?? 1}
        totalData={data?.meta?.total ?? 0}
        onPageChange={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
      />

      <ModelVnDynamicsPayloadSheet
        log={payloadLog}
        onClose={() => setPayloadLog(null)}
      />
    </div>
  );
}
