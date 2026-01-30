"use client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SearchInput from "@/shared/components/SearchInput";
import { Filter, X } from "lucide-react";
import { useState } from "react";

interface GoalTravelOptionsProps {
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  useStatus: string;
  setUseStatus: (value: string) => void;
  year?: string;
  setYear: (value: string) => void;
  month?: string;
  setMonth: (value: string) => void;
  availableYears?: number[];
}

export default function GoalTravelOptions({
  search,
  setSearch,
  status,
  setStatus,
  useStatus,
  setUseStatus,
  year,
  setYear,
  month,
  setMonth,
  availableYears = [],
}: GoalTravelOptionsProps) {
  const [showFilters, setShowFilters] = useState(false);
  const months = [
    { value: "all", label: "Todos los meses" },
    { value: "1", label: "Enero" },
    { value: "2", label: "Febrero" },
    { value: "3", label: "Marzo" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Mayo" },
    { value: "6", label: "Junio" },
    { value: "7", label: "Julio" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Septiembre" },
    { value: "10", label: "Octubre" },
    { value: "11", label: "Noviembre" },
    { value: "12", label: "Diciembre" },
  ];

  const hasActiveFilters =
    search || year || month || status !== "all" || useStatus !== "all";

  const statusOptions = [
    { value: "all", label: "Todos" },
    { value: "1", label: "Activo" },
    { value: "0", label: "Inactivo" },
  ];

  const selectYear = year === "" ? "all" : year;
  const selectMonth = month === "" ? "all" : month;

  const handleYearChange = (value: string) => {
    setYear?.(value === "all" ? "" : value);
  };

  const handleMonthChange = (value: string) => {
    setMonth?.(value === "all" ? "" : value);
  };

  const handleClearFilters = () => {
    setSearch("");
    setYear?.("");
    setMonth?.("");
    setStatus("all");
    setUseStatus("all");
    setShowFilters(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Buscar por meta..."
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="size-4" />
            Filtros
            {(year || month || status !== "all" || useStatus !== "all") && (
              <span className="ml-1 size-2 rounded-full bg-primary" />
            )}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="gap-2"
            >
              <X className="size-4" />
              Limpiar
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-muted/20">
          <div className="space-y-2">
            <label className="text-sm font-medium">Año</label>
            <Select
              value={selectYear || "all"}
              onValueChange={handleYearChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar año" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los años</SelectItem>
                {availableYears.map((yearOption) => (
                  <SelectItem key={yearOption} value={yearOption.toString()}>
                    {yearOption}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mes</label>
            <Select
              value={selectMonth || "all"}
              onValueChange={handleMonthChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar mes" />
              </SelectTrigger>
              <SelectContent>
                {months.map((monthOption) => (
                  <SelectItem key={monthOption.value} value={monthOption.value}>
                    {monthOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Estado</label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
