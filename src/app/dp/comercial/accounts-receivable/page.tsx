import { useState, useCallback } from "react";
import type { SortingState } from "@tanstack/react-table";
import { RefreshCw, Clock } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { successToast, errorToast } from "@/core/core.function";
import { useAccountsReceivable } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.hook";
import { syncAccountsReceivable } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.actions";
import { getAccountsReceivableColumns } from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableColumns";
import AccountsReceivableTable from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableTable";
import AccountsReceivableFiltersBar from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableFilters";
import AccountsReceivableSheet from "@/features/dp/comercial/accounts-receivable/components/AccountsReceivableSheet";
import type { AccountsReceivableFilters } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.interface";
import { ACCOUNTS_RECEIVABLE } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.constants";
import type { AccountReceivable } from "@/features/dp/comercial/accounts-receivable/lib/accountsReceivable.interface";

const INITIAL_FILTERS: AccountsReceivableFilters = {
  page: 1,
  per_page: 100,
  company: ACCOUNTS_RECEIVABLE.COMPANY,
};

function parseSyncedAt(value: string | undefined): string {
  if (!value) return "";
  try {
    const date = parseISO(value.replace(" ", "T"));
    return formatDistanceToNow(date, { addSuffix: true, locale: es });
  } catch {
    return value;
  }
}

export default function AccountsReceivablePage() {
  const [filters, setFilters] = useState<AccountsReceivableFilters>(INITIAL_FILTERS);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const queryFilters: AccountsReceivableFilters = {
    ...filters,
    ...(sorting.length > 0 && {
      sort_by: sorting[0].id,
      sort_order: sorting[0].desc ? "desc" : "asc",
    }),
  };

  const { data, isLoading } = useAccountsReceivable(queryFilters);

  const records = data?.data ?? [];
  const meta = data?.meta;
  const syncedAt = records[0]?.synced_at;

  const handleFiltersChange = useCallback(
    (partial: Partial<AccountsReceivableFilters>) => {
      setFilters((prev) => ({ ...prev, ...partial, page: 1 }));
    },
    [],
  );

  const handleReset = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSorting([]);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncAccountsReceivable();
      successToast(
        "Sincronización iniciada.",
        "Los datos se actualizarán en breve.",
      );
    } catch {
      errorToast("No se pudo iniciar la sincronización.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRowClick = useCallback((row: AccountReceivable) => {
    setSelectedId(row.id);
  }, []);

  const columns = getAccountsReceivableColumns({ onRowClick: handleRowClick });

  return (
    <div className="space-y-4">
      <HeaderTableWrapper>
        <TitleComponent
          title="Cuentas por Cobrar"
          subtitle="Depósito Pakatnamu"
          icon="Banknote"
        >
          {syncedAt && (
            <span className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3" />
              Última sync: {parseSyncedAt(syncedAt)}
            </span>
          )}
        </TitleComponent>

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

      <AccountsReceivableTable
        columns={columns}
        data={records}
        isLoading={isLoading}
        page={filters.page ?? 1}
        perPage={filters.per_page ?? 100}
        totalPages={meta?.last_page ?? 1}
        total={meta?.total ?? 0}
        sorting={sorting}
        onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
        onPerPageChange={(pp) =>
          setFilters((prev) => ({ ...prev, per_page: pp, page: 1 }))
        }
        onSortingChange={setSorting}
      >
        <AccountsReceivableFiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />
      </AccountsReceivableTable>

      <AccountsReceivableSheet
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
