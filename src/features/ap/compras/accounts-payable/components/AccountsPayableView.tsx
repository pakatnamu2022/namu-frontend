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
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { promiseToast } from "@/core/core.function";
import { useAccountsPayable } from "@/features/ap/compras/accounts-payable/lib/accountsPayable.hook";
import {
  syncAccountsPayable,
  addAccountPayableComment,
} from "@/features/ap/compras/accounts-payable/lib/accountsPayable.actions";
import { getAccountsPayableColumns } from "@/features/ap/compras/accounts-payable/components/AccountsPayableColumns";
import AccountsPayableTable from "@/features/ap/compras/accounts-payable/components/AccountsPayableTable";
import SearchInput from "@/shared/components/SearchInput";
import AccountsPayableSheet from "@/features/ap/compras/accounts-payable/components/AccountsPayableSheet";
import BulkCommentModal from "@/features/ap/compras/accounts-payable/components/BulkCommentModal";
import type { AccountsPayableFilters } from "@/features/ap/compras/accounts-payable/lib/accountsPayable.interface";
import { ACCOUNTS_PAYABLE } from "@/features/ap/compras/accounts-payable/lib/accountsPayable.constants";
import type { AccountPayable } from "@/features/ap/compras/accounts-payable/lib/accountsPayable.interface";
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

interface AccountsPayableViewProps {
  company: string;
  permissionModule: string;
  title: string;
  subtitle: string;
  showComments?: boolean;
  dashboardRoute?: string;
}

const MONEDAS = ["PEN", "USD"];

export default function AccountsPayableView({
  company,
  permissionModule,
  title,
  subtitle,
  showComments = true,
  dashboardRoute,
}: AccountsPayableViewProps) {
  const { canGroup, canUpdate } = useModulePermissions(permissionModule);

  const initialFilters: AccountsPayableFilters = useMemo(
    () => ({
      page: 1,
      per_page: DEFAULT_PER_PAGE,
      company,
    }),
    [company],
  );

  const [filters, setFilters] = useState<AccountsPayableFilters>(initialFilters);
  const [sorting, setSorting] = useState<SortingState>([
    { id: "monto_sin_aplicar", desc: true },
  ]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [bulkCommentOpen, setBulkCommentOpen] = useState(false);

  useEffect(() => {
    setRowSelection({});
  }, [filters]);

  const queryFilters: AccountsPayableFilters = {
    ...filters,
    ...(sorting.length > 0 && {
      sort: sorting[0].id,
      direction: sorting[0].desc ? "desc" : "asc",
    }),
  } as AccountsPayableFilters;

  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useAccountsPayable(queryFilters);

  const records = data?.data ?? [];
  const meta = data?.meta;
  const summary = data?.summary;
  const syncedAt = records[0]?.synced_at;

  const formatAmount = (value: number) =>
    new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  const handleFiltersChange = useCallback(
    (partial: Partial<AccountsPayableFilters>) => {
      setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
    },
    [],
  );

  const handleSync = async () => {
    setIsSyncing(true);
    const syncPromise = syncAccountsPayable(company);
    promiseToast(syncPromise, {
      loading: "Sincronizando datos...",
      success: (res) => `${res.message} (${res.synced} registros)`,
      error: "No se pudo completar la sincronización.",
    });
    try {
      await syncPromise;
      await queryClient.invalidateQueries({
        queryKey: [ACCOUNTS_PAYABLE.QUERY_KEY],
      });
    } catch {
      // error shown by promiseToast
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRowClick = useCallback((row: AccountPayable) => {
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
        await addAccountPayableComment(id, comment);
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
      queryKey: [ACCOUNTS_PAYABLE.QUERY_KEY],
    });
  };

  const columns = useMemo(
    () => getAccountsPayableColumns({ onRowClick: handleRowClick, showComments }),
    [handleRowClick, showComments],
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
        className={`grid grid-cols-1 sm:grid-cols-3 gap-3 transition-opacity duration-200 ${isFetching ? "opacity-60" : "opacity-100"}`}
      >
        <MetricCard
          title="Total documentos"
          value={summary?.total_documents.toLocaleString("en-US")}
          icon={FileText}
          color="blue"
          isLoading={isLoading}
        />
        <MetricCard
          title="Monto total"
          value={summary ? formatAmount(summary.total_amount) : undefined}
          icon={Banknote}
          color="slate"
          isLoading={isLoading}
        />
        <MetricCard
          title="Saldo sin aplicar"
          value={summary ? formatAmount(summary.total_pending) : undefined}
          icon={Banknote}
          color="indigo"
          isLoading={isLoading}
        />
      </div>

      <AccountsPayableTable
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
        <div className="flex items-center gap-2 flex-wrap">
          <SearchInput
            value={filters.search ?? ""}
            onChange={(v) => handleFiltersChange({ search: v || undefined })}
            placeholder="Buscar proveedor, doc..."
          />

          <ButtonGroup>
            <Button
              type="button"
              size="sm"
              variant={filters.moneda === undefined ? "default" : "outline"}
              onClick={() => handleFiltersChange({ moneda: undefined })}
            >
              Todas
            </Button>
            {MONEDAS.map((m) => (
              <Button
                key={m}
                type="button"
                size="sm"
                variant={filters.moneda === m ? "default" : "outline"}
                onClick={() => handleFiltersChange({ moneda: m })}
              >
                {m}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </AccountsPayableTable>

      <AccountsPayableSheet
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
