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
import type { CuentasPorCobrarFilters } from "../lib/cuentasPorCobrar.interface";

interface Props {
  filters: CuentasPorCobrarFilters;
  onFiltersChange: (filters: Partial<CuentasPorCobrarFilters>) => void;
  onReset: () => void;
}

const CURRENCY_OPTIONS = [
  { value: "PEN", label: "PEN - Soles" },
  { value: "USD", label: "USD - Dólares" },
];

const OVERDUE_STATUS_OPTIONS = [
  { value: "Vencido", label: "Vencido" },
  { value: "Por Vencer", label: "Por Vencer" },
  { value: "Al día", label: "Al día" },
  { value: "Vigente", label: "Vigente" },
];

const EMPTY = "__all__";

export default function CuentasPorCobrarFiltersBar({
  filters,
  onFiltersChange,
  onReset,
}: Props) {
  const hasActiveFilters = !!(
    filters.search ||
    filters.sede_id ||
    filters.currency ||
    filters.overdue_status ||
    filters["document_date[from]"] ||
    filters["document_date[to]"] ||
    filters["document_due_date[from]"] ||
    filters["document_due_date[to]"]
  );

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex flex-wrap gap-2 items-center">
        {/* Búsqueda general */}
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Buscar documento, cliente, vendedor..."
            className="pl-8"
            value={filters.search ?? ""}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
          />
        </div>

        {/* Moneda */}
        <Select
          value={filters.currency ?? EMPTY}
          onValueChange={(v) =>
            onFiltersChange({ currency: v === EMPTY ? undefined : v })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Moneda" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={EMPTY}>Todas las monedas</SelectItem>
            {CURRENCY_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Estado vencido */}
        <Select
          value={filters.overdue_status ?? EMPTY}
          onValueChange={(v) =>
            onFiltersChange({ overdue_status: v === EMPTY ? undefined : v })
          }
        >
          <SelectTrigger className="w-[160px]">
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

        {/* Sede ID */}
        <Input
          type="number"
          placeholder="Sede ID"
          className="w-[100px]"
          value={filters.sede_id ?? ""}
          onChange={(e) =>
            onFiltersChange({
              sede_id: e.target.value ? Number(e.target.value) : null,
            })
          }
        />

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onReset} className="gap-1">
            <X className="size-4" />
            Limpiar
          </Button>
        )}
      </div>

      {/* Rangos de fecha */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Fecha Doc:</span>
          <Input
            type="date"
            className="w-[150px] text-sm"
            value={filters["document_date[from]"] ?? ""}
            onChange={(e) =>
              onFiltersChange({ "document_date[from]": e.target.value || undefined })
            }
          />
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="date"
            className="w-[150px] text-sm"
            value={filters["document_date[to]"] ?? ""}
            onChange={(e) =>
              onFiltersChange({ "document_date[to]": e.target.value || undefined })
            }
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground whitespace-nowrap">Vencimiento:</span>
          <Input
            type="date"
            className="w-[150px] text-sm"
            value={filters["document_due_date[from]"] ?? ""}
            onChange={(e) =>
              onFiltersChange({ "document_due_date[from]": e.target.value || undefined })
            }
          />
          <span className="text-xs text-muted-foreground">—</span>
          <Input
            type="date"
            className="w-[150px] text-sm"
            value={filters["document_due_date[to]"] ?? ""}
            onChange={(e) =>
              onFiltersChange({ "document_due_date[to]": e.target.value || undefined })
            }
          />
        </div>
      </div>
    </div>
  );
}
