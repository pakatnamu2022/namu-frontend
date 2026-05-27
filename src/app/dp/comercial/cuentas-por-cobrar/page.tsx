import { useState, useCallback } from "react";
import type { SortingState } from "@tanstack/react-table";
import { RefreshCw, Clock } from "lucide-react";
import { formatDistanceToNow, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import TitleComponent from "@/shared/components/TitleComponent";
import HeaderTableWrapper from "@/shared/components/HeaderTableWrapper";
import { successToast, errorToast } from "@/core/core.function";
import { useCuentasPorCobrar } from "@/features/dp/comercial/cuentas-por-cobrar/lib/cuentasPorCobrar.hook";
import { syncCuentasPorCobrar } from "@/features/dp/comercial/cuentas-por-cobrar/lib/cuentasPorCobrar.actions";
import { getCuentasPorCobrarColumns } from "@/features/dp/comercial/cuentas-por-cobrar/components/CuentasPorCobrarColumns";
import CuentasPorCobrarTable from "@/features/dp/comercial/cuentas-por-cobrar/components/CuentasPorCobrarTable";
import CuentasPorCobrarFiltersBar from "@/features/dp/comercial/cuentas-por-cobrar/components/CuentasPorCobrarFilters";
import CuentasPorCobrarSheet from "@/features/dp/comercial/cuentas-por-cobrar/components/CuentasPorCobrarSheet";
import type { CuentasPorCobrarFilters } from "@/features/dp/comercial/cuentas-por-cobrar/lib/cuentasPorCobrar.interface";
import { CUENTAS_POR_COBRAR } from "@/features/dp/comercial/cuentas-por-cobrar/lib/cuentasPorCobrar.constants";
import type { CuentaPorCobrar } from "@/features/dp/comercial/cuentas-por-cobrar/lib/cuentasPorCobrar.interface";

const INITIAL_FILTERS: CuentasPorCobrarFilters = {
  page: 1,
  per_page: 100,
  company: CUENTAS_POR_COBRAR.COMPANY,
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

export default function CuentasPorCobrarPage() {
  const [filters, setFilters] = useState<CuentasPorCobrarFilters>(INITIAL_FILTERS);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const queryFilters: CuentasPorCobrarFilters = {
    ...filters,
    ...(sorting.length > 0 && {
      sort_by: sorting[0].id,
      sort_order: sorting[0].desc ? "desc" : "asc",
    }),
  };

  const { data, isLoading } = useCuentasPorCobrar(queryFilters);

  const records = data?.data ?? [];
  const meta = data?.meta;
  const syncedAt = records[0]?.synced_at;

  const handleFiltersChange = useCallback(
    (partial: Partial<CuentasPorCobrarFilters>) => {
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
      await syncCuentasPorCobrar();
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

  const handleRowClick = useCallback((row: CuentaPorCobrar) => {
    setSelectedId(row.id);
  }, []);

  const columns = getCuentasPorCobrarColumns({ onRowClick: handleRowClick });

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

      <CuentasPorCobrarTable
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
        <CuentasPorCobrarFiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleReset}
        />
      </CuentasPorCobrarTable>

      <CuentasPorCobrarSheet
        selectedId={selectedId}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
