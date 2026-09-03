"use client";

import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ClipboardList, ClipboardCopy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { successToast } from "@/core/core.function";

interface Props<T> {
  columns: ColumnDef<T>[];
  data: T[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function LiquidacionBbssTable<T>({
  columns,
  data,
  children,
  isLoading,
}: Props<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    enableSortingRemoval: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-2">
      {children}

      {isLoading ? (
        <div className="space-y-2 p-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      ) : !data.length ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <ClipboardList size={50} />
          <p className="text-sm">No se encontraron registros</p>
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-md border border-border">
          <table className="text-xs border-collapse w-max min-w-full">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="bg-muted/60">
                  {/* Columna temporal de desarrollo: copia la fila como JSON para reportar datos */}
                  <th
                    style={{ width: 28 }}
                    className="border border-border px-1 py-0.5 bg-muted/60"
                    title="Herramienta temporal de desarrollo"
                  />
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
              {table.getRowModel().rows.map((row, rowIdx) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-muted/40 transition-colors",
                    rowIdx % 2 === 0 ? "bg-background" : "bg-muted/20",
                  )}
                >
                  {/* Columna temporal de desarrollo: copia la fila como JSON para reportar datos */}
                  <td
                    style={{ width: 28 }}
                    className="border border-border px-1 py-0.5 text-center"
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="size-5"
                      title="Copiar fila (JSON)"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(JSON.stringify(row.original, null, 2))
                          .then(() =>
                            successToast("Fila copiada al portapapeles"),
                          );
                      }}
                    >
                      <ClipboardCopy className="size-3" />
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
