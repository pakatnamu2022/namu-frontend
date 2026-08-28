"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ClipboardCopy, ClipboardList, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { SearchableSelect } from "@/shared/components/SearchableSelect";
import { Option } from "@/core/core.interface";
import { successToast } from "@/core/core.function";
import { PayrollRegisterResource } from "../lib/payroll-register.interface";
import { COLUMN_GROUPS, ColumnGroup } from "./PayrollRegisterColumns";

interface Props {
  data: PayrollRegisterResource[];
  isLoading?: boolean;
}

function GroupToggleHeader({
  group,
  collapsed,
  onToggle,
}: {
  group: ColumnGroup;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <th
      colSpan={collapsed ? 1 : group.columns.length}
      className={cn(
        "border border-border px-2 py-1 text-center text-xs font-bold whitespace-nowrap select-none",
        group.color,
      )}
    >
      <button
        onClick={onToggle}
        className="flex items-center gap-1 mx-auto hover:opacity-70 transition-opacity"
        type="button"
      >
        {collapsed ? (
          <ChevronRight className="size-3" />
        ) : (
          <ChevronLeft className="size-3" />
        )}
        <span>{group.label}</span>
      </button>
    </th>
  );
}

export default function PayrollRegisterTable({ data, isLoading }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({
    dias: false,
    bbss: true,
    aportes: true,
  });
  const [sorting, setSorting] = useState<SortingState>([
    { id: "worker_name", desc: false },
  ]);
  const [search, setSearch] = useState("");
  const [occupation, setOccupation] = useState("");

  const toggleGroup = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const activeColumns = useMemo<ColumnDef<PayrollRegisterResource>[]>(() => {
    return COLUMN_GROUPS.flatMap((g) => {
      if (collapsed[g.id]) return [g.columns[g.columns.length - 1]];
      return g.columns;
    });
  }, [collapsed]);

  const occupationOptions: Option[] = useMemo(() => {
    const unique = Array.from(
      new Set(data.map((d) => d.occupation).filter(Boolean) as string[]),
    ).sort((a, b) => a.localeCompare(b));
    return unique.map((o) => ({ label: o, value: o }));
  }, [data]);

  const filteredData = useMemo(() => {
    let rows = data;

    if (occupation) {
      rows = rows.filter((d) => d.occupation === occupation);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      rows = rows.filter(
        (d) =>
          (d.worker_name ?? "").toLowerCase().includes(q) ||
          (d.worker_vat ?? "").toLowerCase().includes(q),
      );
    }

    return rows;
  }, [data, occupation, search]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: filteredData,
    columns: activeColumns,
    state: { sorting },
    onSortingChange: setSorting,
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const hasFilters = !!search || !!occupation;

  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
        <ClipboardList size={50} />
        <p className="text-sm">
          Seleccione empresa y periodo para ver la planilla
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre o DNI..."
            className="h-8 pl-8 text-xs"
          />
        </div>

        <SearchableSelect
          options={occupationOptions}
          value={occupation}
          onChange={setOccupation}
          placeholder="Cargo"
          classNameDiv="w-56"
        />

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-xs gap-1"
            onClick={() => {
              setSearch("");
              setOccupation("");
            }}
          >
            <X className="size-3" />
            Limpiar filtros
          </Button>
        )}
      </div>

      <div className="overflow-x-auto w-full rounded-md border border-border">
        <table className="text-xs border-collapse w-max min-w-full">
          <thead>
            {/* Fila 1: grupos */}
            <tr>
              {/* Columna temporal de desarrollo — quitar cuando ya no se necesite */}
              <th
                rowSpan={2}
                className="border border-border px-1 py-0.5 bg-muted/60"
                title="Herramienta temporal de desarrollo"
              />
              {COLUMN_GROUPS.map((group) => (
                <GroupToggleHeader
                  key={group.id}
                  group={group}
                  collapsed={!!collapsed[group.id]}
                  onToggle={() => toggleGroup(group.id)}
                />
              ))}
            </tr>
            {/* Fila 2: headers individuales (ordenables) */}
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="bg-muted/60">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    style={{ width: header.getSize() }}
                    className="border border-border px-1 py-0.5 text-left font-semibold whitespace-nowrap text-muted-foreground"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, rowIdx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-muted/40 transition-colors",
                    rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20",
                  )}
                >
                  {/* Columna temporal de desarrollo: copia la fila como JSON para reportar datos */}
                  <td className="border border-border px-1 py-0.5 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-6"
                      title="Copiar fila (JSON)"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(JSON.stringify(row.original, null, 2))
                          .then(() =>
                            successToast("Fila copiada al portapapeles"),
                          );
                      }}
                    >
                      <ClipboardCopy className="size-3.5" />
                    </Button>
                  </td>
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      style={{ width: cell.column.getSize() }}
                      className="border border-border px-2 py-1 whitespace-nowrap"
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={activeColumns.length + 1}
                  className="border border-border px-2 py-8 text-center text-muted-foreground"
                >
                  Ningún trabajador coincide con los filtros aplicados
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="flex items-center gap-2 px-3 py-2 border-t border-border text-xs text-muted-foreground flex-wrap">
          <span className="font-semibold">
            {table.getRowModel().rows.length} de {data.length} registros
          </span>
          <span>·</span>
          <span>Clic en un grupo para expandir/contraer, clic en una columna para ordenar</span>
          <div className="ml-auto flex gap-1 flex-wrap">
            {COLUMN_GROUPS.filter((g) => g.id !== "identidad").map((g) => (
              <Button
                key={g.id}
                variant="outline"
                size="sm"
                className="h-6 text-xs px-2"
                onClick={() => toggleGroup(g.id)}
              >
                {collapsed[g.id] ? "+" : "−"} {g.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
