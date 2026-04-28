import { Button } from "@/components/ui/button";
import { DateRangePickerFilter } from "@/shared/components/DateRangePickerFilter";
import { RefreshCw } from "lucide-react";

interface AdoptionFiltersProps {
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  onDateChange: (from: Date | undefined, to: Date | undefined) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export default function AdoptionFilters({
  dateFrom,
  dateTo,
  onDateChange,
  onRefresh,
  isLoading,
}: AdoptionFiltersProps) {
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
        disabled={isLoading}
        variant="outline"
      >
        <RefreshCw className={`size-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
        Actualizar
      </Button>
    </div>
  );
}
