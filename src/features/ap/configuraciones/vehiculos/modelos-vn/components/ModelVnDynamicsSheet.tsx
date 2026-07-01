"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { DataTable } from "@/shared/components/DataTable";
import DataTablePagination from "@/shared/components/DataTablePagination";
import FilterWrapper from "@/shared/components/FilterWrapper";
import SearchInput from "@/shared/components/SearchInput";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useModelVnSyncLogs } from "../lib/modelsVn.hook";
import { syncModelVn } from "../lib/modelsVn.actions";
import { modelVnSyncLogsColumns } from "./ModelVnSyncLogsColumns";
import ModelVnDynamicsPayloadSheet from "./ModelVnDynamicsPayloadSheet";
import type { ModelVnSyncLog, SyncStatus } from "../lib/modelsVn.interface";
import { errorToast, successToast } from "@/core/core.function";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";
import { MODELS_VN } from "../lib/modelsVn.constanst";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "in_progress", label: "En proceso" },
  { value: "completed", label: "Completado" },
  { value: "failed", label: "Fallido" },
];

interface Props {
  open: boolean;
  onClose: () => void;
  modelId?: number;
}

export default function ModelVnDynamicsSheet({ open, onClose, modelId }: Props) {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState<number>(DEFAULT_PER_PAGE);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [payloadLog, setPayloadLog] = useState<ModelVnSyncLog | null>(null);
  const [retryingId, setRetryingId] = useState<number | null>(null);
  const queryClient = useQueryClient();
  const { QUERY_KEY } = MODELS_VN;

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, per_page]);

  const { data, isLoading, refetch } = useModelVnSyncLogs(
    {
      page,
      per_page,
      ...(modelId ? { model_id: modelId } : {}),
      ...(search ? { code: search } : {}),
      ...(statusFilter ? { status: statusFilter as SyncStatus } : {}),
    },
    { enabled: open }
  );

  const handleRetry = async (log: ModelVnSyncLog) => {
    setRetryingId(log.id);
    try {
      await syncModelVn(log.model_vn_id);
      successToast(`Sincronización iniciada para ${log.code}.`);
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "sync-logs"] });
      await refetch();
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message || "Error al iniciar la sincronización."
      );
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <>
      <GeneralSheet
        open={open}
        onClose={onClose}
        title="Artículos Dynamics"
        subtitle="Trazabilidad de sincronización de modelos VN a Dynamics"
        icon="RefreshCw"
        size="7xl"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2">
            <FilterWrapper>
              {!modelId && (
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Buscar por código..."
                />
              )}
              <SearchableSelect
                options={STATUS_OPTIONS}
                value={statusFilter}
                onChange={setStatusFilter}
                placeholder="Filtrar por estado"
                className="min-w-52"
                classNameOption="text-xs"
              />
            </FilterWrapper>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost" onClick={() => refetch()}>
                  <RefreshCw className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Actualizar</TooltipContent>
            </Tooltip>
          </div>

          <DataTable
            columns={modelVnSyncLogsColumns({
              onViewPayload: setPayloadLog,
              onRetry: handleRetry,
              retryingId,
            })}
            data={data?.data ?? []}
            isLoading={isLoading}
          />

          <DataTablePagination
            page={page}
            totalPages={data?.meta?.last_page ?? 1}
            totalData={data?.meta?.total ?? 0}
            onPageChange={setPage}
            per_page={per_page}
            setPerPage={setPerPage}
          />
        </div>
      </GeneralSheet>

      <ModelVnDynamicsPayloadSheet
        log={payloadLog}
        onClose={() => setPayloadLog(null)}
      />
    </>
  );
}
