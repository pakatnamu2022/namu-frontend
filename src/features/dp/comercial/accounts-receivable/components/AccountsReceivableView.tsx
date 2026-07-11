import { useState, useCallback, useEffect, useMemo } from "react";
import { useModulePermissions } from "@/shared/hooks/useModulePermissions";
import { useQueryClient } from "@tanstack/react-query";
import type { SortingState, RowSelectionState } from "@tanstack/react-table";
import {
  RefreshCw,
  Clock,
  BarChart2,
  FileText,
  Banknote,
  TrendingDown,
  TrendingUp,
  Send,
  MessageSquare,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { promiseToast } from "@/core/core.function";
import { useAccountsReceivable } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.hook";
import {
  syncAccountsReceivable,
  sendDueReports,
  sendGlobalExcel,
  downloadGlobalExcel,
  addAccountComment,
} from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.actions";
import { getAccountsReceivableColumns } from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableColumns";
import AccountsReceivableTable from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableTable";
import AccountsReceivableTreeFilter from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableTreeFilter";
import SearchInput from "@/shared/components/SearchInput";
import AccountsReceivableSheet from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableSheet";
import BulkCommentModal from "@/features/dp/comercial/accounts-receivable/components/BulkCommentModal";
import type { AccountsReceivableFilters } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.interface";
import { ACCOUNTS_RECEIVABLE } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.constants";
import type { AccountReceivable } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.interface";
import { MetricCard } from "@/shared/components/MetricCard";
import { DEFAULT_PER_PAGE } from "@/core/core.constants";

function parseSyncedAt(value: string | undefined): string {
  if (!value) return "";
  try {
    const date = parseISO(value.replace(" ", "T"));
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch {
    return value;
  }
}

interface AccountsReceivableViewProps {
  company: string;
  areaId?: number;
  permissionModule: string;
  title: string;
  subtitle: string;
  showComments?: boolean;
  dashboardRoute?: string;
}

export default function AccountsReceivableView({
  company,
  areaId,
  permissionModule,
  title,
  subtitle,
  showComments = true,
  dashboardRoute,
}: AccountsReceivableViewProps) {
  const { canGroup, canUpdate, canExport, canSend } =
    useModulePermissions(permissionModule);

  const initialFilters: AccountsReceivableFilters = useMemo(
    () => ({
      page: 1,
      per_page: DEFAULT_PER_PAGE,
      company,
      ...(areaId !== undefined && { area_id: areaId }),
    }),
    [company, areaId],
  );

  const [filters, setFilters] =
    useState<AccountsReceivableFilters>(initialFilters);
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "overdue_days",
      desc: true,
    },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isSendingExcel, setIsSendingExcel] = useState(false);
  const [isDownloadingExcel, setIsDownloadingExcel] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkCommentOpen, setBulkCommentOpen] = useState(false);

  useEffect(() => {
    setRowSelection({});
  }, [filters]);

  const queryFilters: AccountsReceivableFilters = {
    ...filters,
    ...(sorting.length > 0 && {
      sort: sorting[0].id,
      direction: sorting[0].desc ? "desc" : "asc",
    }),
  };

  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useAccountsReceivable(queryFilters);

  const records = data?.data ?? [];
  const meta = data?.meta;
  const summary = data?.summary;
  const syncedAt = records[0]?.synced_at;

  const formatPEN = (value: number) =>
    `S/ ${new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value)}`;

  const handleFiltersChange = useCallback(
    (partial: Partial<AccountsReceivableFilters>) => {
      setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setFilters(initialFilters);
    setSorting([]);
  }, [initialFilters]);

  const handleSync = async () => {
    setIsSyncing(true);
    const syncPromise = syncAccountsReceivable(company, areaId);
    promiseToast(syncPromise, {
      loading: "Sincronizando datos...",
      success: (res) => `${res.message} (${res.synced} registros)`,
      error: "No se pudo completar la sincronización.",
    });
    try {
      await syncPromise;
      await queryClient.invalidateQueries({
        queryKey: [ACCOUNTS_RECEIVABLE.QUERY_KEY],
      });
    } catch {
      // error shown by promiseToast
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDownloadGlobalExcel = async () => {
    setIsDownloadingExcel(true);
    try {
      await downloadGlobalExcel(company, areaId);
    } catch {
      toast.error("No se pudo descargar el Excel global.");
    } finally {
      setIsDownloadingExcel(false);
    }
  };

  const handleSendGlobalExcel = async () => {
    setIsSendingExcel(true);
    const promise = sendGlobalExcel(company, areaId);
    promiseToast(promise, {
      loading: "Enviando Excel global...",
      success: (res) => res.message,
      error: "No se pudo enviar el Excel global.",
    });
    try {
      await promise;
    } catch {
      // error shown by promiseToast
    } finally {
      setIsSendingExcel(false);
    }
  };

  const handleSendReports = async () => {
    setIsSending(true);
    const sendPromise = sendDueReports(company, areaId);
    promiseToast(sendPromise, {
      loading: "Enviando reportes...",
      success: (res) => res.message,
      error: "No se pudo enviar los reportes.",
    });
    try {
      await sendPromise;
    } catch {
      // error shown by promiseToast
    } finally {
      setIsSending(false);
    }
  };

  const handleRowClick = useCallback((row: AccountReceivable) => {
    setSelectedId(row.id);
    setIsSheetOpen(true);
  }, []);

  const selectedIds = Object.keys(rowSelection).map(Number);
  const selectedRecords = records.filter((r) => rowSelection[String(r.id)]);

  const handleBulkComment = async (comment: string) => {
    const ids = Object.keys(rowSelection).map(Number);
    if (ids.length === 0) return;

    const toastId = toast.loading("Iniciando...");
    let added = 0;

    for (const id of ids) {
      try {
        await addAccountComment(id, comment);
        added++;
        toast.loading(`${added} ${added === 1 ? "agregado" : "agregados"}`, {
          id: toastId,
        });
      } catch {
        // continue with remaining
      }
    }

    toast.success(
      `${added} ${added === 1 ? "comentario agregado" : "comentarios agregados"}`,
      { id: toastId },
    );

    setRowSelection({});
    setBulkCommentOpen(false);
    await queryClient.invalidateQueries({
      queryKey: [ACCOUNTS_RECEIVABLE.QUERY_KEY],
    });
  };

  const columns = useMemo(
    () =>
      getAccountsReceivableColumns({
        onRowClick: handleRowClick,
        canGroup,
        showComments,
      }),
    [handleRowClick, canGroup, showComments],
  );

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent title={title} subtitle={subtitle} icon="Banknote">
          {syncedAt && (
            <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Última sync: {parseSyncedAt(syncedAt)}
            </span>
          )}
        </TitleComponent>

        {showComments && canGroup && selectedIds.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setBulkCommentOpen(true)}
          >
            <MessageSquare className="size-4" />
            <span className="hidden sm:inline">
              Comentar ({selectedIds.length})
            </span>
          </Button>
        )}

        {dashboardRoute && (
          <Link to={dashboardRoute}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <BarChart2 className="size-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Button>
          </Link>
        )}

        {canExport && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleDownloadGlobalExcel}
            disabled={isDownloadingExcel}
          >
            <Download
              className={`size-4 ${isDownloadingExcel ? "animate-bounce" : ""}`}
            />
            <span className="hidden sm:inline">Descargar Excel</span>
          </Button>
        )}

        {canSend && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleSendGlobalExcel}
            disabled={isSendingExcel}
          >
            <FileText
              className={`size-4 ${isSendingExcel ? "animate-pulse" : ""}`}
            />
            <span className="hidden sm:inline">Enviar Excel</span>
          </Button>
        )}

        {canSend && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={handleSendReports}
            disabled={isSending}
          >
            <Send className={`size-4 ${isSending ? "animate-pulse" : ""}`} />
            <span className="hidden sm:inline">Enviar reportes</span>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={handleSync}
          disabled={isSyncing}
        >
          <RefreshCw className={`size-4 ${isSyncing ? "animate-spin" : ""}`} />
          Sincronizar
        </Button>
      </HeaderTableWrapper>

      <div
        className={`grid grid-cols-2 md:grid-cols-4 gap-3 transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}
      >
        <MetricCard
          title="Total documentos"
          value={summary?.total_documents.toLocaleString("en-US")}
          icon={FileText}
          color="blue"
          isLoading={isLoading}
        />
        <MetricCard
          title="Saldo total"
          value={summary ? formatPEN(summary.total_balance_pen) : undefined}
          icon={Banknote}
          color="indigo"
          isLoading={isLoading}
        />
        <MetricCard
          title="Saldo vencido"
          value={summary ? formatPEN(summary.overdue_balance_pen) : undefined}
          icon={TrendingDown}
          color="red"
          showProgress
          progressValue={summary?.overdue_balance_pen}
          progressMax={summary?.total_balance_pen}
          isLoading={isLoading}
        />
        <MetricCard
          title="Saldo por vencer"
          value={summary ? formatPEN(summary.current_balance_pen) : undefined}
          icon={TrendingUp}
          color="green"
          showProgress
          progressValue={summary?.current_balance_pen}
          progressMax={summary?.total_balance_pen}
          isLoading={isLoading}
        />
      </div>

      <AccountsReceivableTreeFilter
        company={company}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
      />

      <AccountsReceivableTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        page={filters.page ?? 1}
        perPage={filters.per_page ?? DEFAULT_PER_PAGE}
        totalPages={meta?.last_page ?? 1}
        total={meta?.total ?? 0}
        sorting={sorting}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        onPerPageChange={(pp) =>
          setFilters((prev) => ({ ...prev, per_page: pp, page: 1 }))
        }
        onSortingChange={setSorting}
        rowSelection={rowSelection}
        onRowSelectionChange={setRowSelection}
      >
        <SearchInput
          value={filters.search ?? ""}
          onChange={(v) => handleFiltersChange({ search: v || undefined })}
          placeholder="Buscar cliente, doc..."
        />
      </AccountsReceivableTable>

      <AccountsReceivableSheet
        selectedId={selectedId}
        open={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        canUpdate={canUpdate}
        showComments={showComments}
      />

      {showComments && (
        <BulkCommentModal
          open={bulkCommentOpen}
          selectedRecords={selectedRecords}
          onClose={() => setBulkCommentOpen(false)}
          onSubmit={handleBulkComment}
        />
      )}
    </div>
  );
}
