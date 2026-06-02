import { useMemo } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import SearchInput from "@/shared/components/SearchInput";
import FilterWrapper from "@/shared/components/FilterWrapper";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import type { AccountsReceivableFilters } from "../lib/accountsReceivable.interface";

interface Props {
  filters: AccountsReceivableFilters;
  onFiltersChange: (filters: Partial<AccountsReceivableFilters>) => void;
  onReset: () => void;
}

const OVERDUE_STATUS_OPTIONS = [
  { value: "Vencido", label: "Vencido" },
  { value: "Por Vencer", label: "Por Vencer" },
  { value: "Al día", label: "Al día" },
  { value: "Vigente", label: "Vigente" },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2019 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: String(y), label: String(y) };
});

export default function AccountsReceivableFiltersBar({
  filters,
  onFiltersChange,
  onReset,
}: Props) {
  const { data: sedesData } = useAllSedes();

  const sedeOptions = useMemo(
    () =>
      (sedesData ?? []).map((s) => ({
        value: String(s.id),
        label: s.localidad ?? s.description,
        description: s.abreviatura,
      })),
    [sedesData],
  );

  const hasActiveFilters = !!(
    filters.search ||
    filters.sede_id ||
    filters.year ||
    filters.overdue_status
  );

  return (
    <FilterWrapper>
      {/* Search */}
      <SearchInput
        value={filters.search ?? ""}
        onChange={(v) => onFiltersChange({ search: v })}
        placeholder="Buscar documento, cliente, vendedor..."
      />

      {/* Año */}
      <SearchableSelect
        options={YEAR_OPTIONS}
        value={filters.year ? String(filters.year) : ""}
        onChange={(v) => onFiltersChange({ year: v ? Number(v) : null })}
        placeholder="Año"
        className="w-[110px]"
        classNameDiv="w-[110px]"
      />

      {/* Sede */}
      <SearchableSelect
        options={sedeOptions}
        value={filters.sede_id ? String(filters.sede_id) : ""}
        onChange={(v) => onFiltersChange({ sede_id: v ? Number(v) : null })}
        placeholder="Sede"
        className="w-[180px]"
        classNameDiv="w-[180px]"
      />

      {/* Estado */}
      <SearchableSelect
        options={OVERDUE_STATUS_OPTIONS}
        value={filters.overdue_status ?? ""}
        onChange={(v) => onFiltersChange({ overdue_status: v || undefined })}
        placeholder="Estado"
        className="w-[150px]"
        classNameDiv="w-[150px]"
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <X className="size-4" />
          Limpiar
        </Button>
      )}
    </FilterWrapper>
  );
}
