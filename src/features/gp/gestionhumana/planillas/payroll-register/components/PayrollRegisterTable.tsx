"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  ColumnDef,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
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

  const toggleGroup = (id: string) =>
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));

  const activeColumns = useMemo<ColumnDef<PayrollRegisterResource>[]>(() => {
    return COLUMN_GROUPS.flatMap((g) => {
      if (collapsed[g.id]) return [g.columns[g.columns.length - 1]];
      return g.columns;
    });
  }, [collapsed]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns: activeColumns,
    getCoreRowModel: getCoreRowModel(),
  });

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
    <div className="overflow-x-auto w-full rounded-md border border-border">
      <table className="text-xs border-collapse w-max min-w-full">
        <thead>
          {/* Fila 1: grupos */}
          <tr>
            {COLUMN_GROUPS.map((group) => (
              <GroupToggleHeader
                key={group.id}
                group={group}
                collapsed={!!collapsed[group.id]}
                onToggle={() => toggleGroup(group.id)}
              />
            ))}
          </tr>
          {/* Fila 2: headers individuales */}
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="bg-muted/60">
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  style={{ width: header.getSize() }}
                  className="border border-border px-2 py-1 text-left font-semibold whitespace-nowrap text-muted-foreground"
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
          {table.getRowModel().rows.map((row, rowIdx) => (
            <tr
              key={row.id}
              className={cn(
                "hover:bg-muted/40 transition-colors",
                rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20",
              )}
            >
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
          ))}
        </tbody>
      </table>

      <div className="flex items-center gap-2 px-3 py-2 border-t border-border text-xs text-muted-foreground flex-wrap">
        <span className="font-semibold">{data.length} registros</span>
        <span>·</span>
        <span>
          Haz clic en el encabezado de un grupo para expandirlo o contraerlo
        </span>
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
  );
}
