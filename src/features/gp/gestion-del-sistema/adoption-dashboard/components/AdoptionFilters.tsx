import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import { RefreshCw, Zap } from "lucide-react";

interface AdoptionFiltersProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateChange: (from: Date | undefined, to: Date | undefined) => void;
  onRefresh: () => void;
  onForceRefresh: () => void;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: string | null;
}

export default function AdoptionFilters({
  dateFrom,
  dateTo,
  onDateChange,
  onRefresh,
  onForceRefresh,
  isLoading,
  isRefreshing,
  lastUpdated,
}: AdoptionFiltersProps) {
  const lastUpdatedLabel = lastUpdated
    ? format(new Date(lastUpdated), "dd MMM HH:mm", { locale: es })
    : null;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
      <DateRangePickerFilter
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateChange={onDateChange}
        placeholder="Seleccionar período"
        className="w-64"
      />
      <Button
        size="sm"
        onClick={onRefresh}
        disabled={isLoading || isRefreshing}
        variant="outline"
      >
        <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
        Actualizar
      </Button>
      <Button
        size="sm"
        onClick={onForceRefresh}
        disabled={isLoading || isRefreshing}
        variant="outline"
      >
        <Zap className={`size-4 mr-2 ${isRefreshing ? "animate-pulse" : ""}`} />
        {isRefreshing ? "Actualizando…" : "Actualizar ahora"}
      </Button>
      {lastUpdatedLabel && (
        <span className="text-xs text-muted-foreground whitespace-nowrap">
          Último caché: {lastUpdatedLabel}
        </span>
      )}
    </div>
  );
}
