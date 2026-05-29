import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { useAllSedes } from "@/features/gp/maestro-general/sede/lib/sede.hook";
import type { CuentasPorCobrarFilters } from "../lib/cuentasPorCobrar.interface";

interface Props {
  filters: CuentasPorCobrarFilters;
  onFiltersChange: (filters: Partial<CuentasPorCobrarFilters>) => void;
  onReset: () => void;
}

const OVERDUE_STATUS_OPTIONS = [
  { value: "Vencido", label: "Vencido" },
  { value: "Por Vencer", label: "Por Vencer" },
  { value: "Al día", label: "Al día" },
  { value: "Vigente", label: "Vigente" },
];

const EMPTY = "__all__";
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 2019 }, (_, i) => {
  const y = CURRENT_YEAR - i;
  return { value: String(y), label: String(y) };
});

export default function CuentasPorCobrarFiltersBar({
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
    <div className="flex flex-wrap gap-2 items-center w-full">
      {/* Búsqueda */}
      <div className="relative min-w-[200px] flex-1">
        <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar documento, cliente, vendedor..."
          className="pl-8"
          value={filters.search ?? ""}
          onChange={(e) => onFiltersChange({ search: e.target.value })}
        />
      </div>

      {/* Año */}
      <Select
        value={filters.year ? String(filters.year) : EMPTY}
        onValueChange={(v) =>
          onFiltersChange({ year: v === EMPTY ? null : Number(v) })
        }
      >
        <SelectTrigger className="w-[110px]">
          <SelectValue placeholder="Año" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY}>Todos</SelectItem>
          {YEAR_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

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
      <Select
        value={filters.overdue_status ?? EMPTY}
        onValueChange={(v) =>
          onFiltersChange({ overdue_status: v === EMPTY ? undefined : v })
        }
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={EMPTY}>Todos los estados</SelectItem>
          {OVERDUE_STATUS_OPTIONS.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
          <X className="size-4" />
          Limpiar
        </Button>
      )}
    </div>
  );
}
