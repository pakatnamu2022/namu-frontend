"use client";

import {
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { useState } from "react";
import type { VisibilityState } from "@tanstack/react-table";
import FormSkeleton from "@/shared/components/FormSkeleton";

interface VehicleInspectionSelectionTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  children?: React.ReactNode;
  isLoading?: boolean;
  initialColumnVisibility?: VisibilityState;
  onRowClick?: (row: TData) => void;
}

export function VehicleInspectionSelectionTable<TData, TValue>({
  columns,
  data,
  children,
  isLoading = false,
  initialColumnVisibility,
  onRowClick,
}: VehicleInspectionSelectionTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    initialColumnVisibility ?? {}
  );

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    state: {
      columnFilters,
      columnVisibility,
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
  });

  const handleRowClick = (rowData: TData) => {
    if (onRowClick) {
      onRowClick(rowData);
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full items-end">
      <div className="grid md:flex md:flex-wrap gap-2 md:justify-between w-full">
        {children}
      </div>

      {/* Vista de Tabla para pantallas grandes */}
      <div className="hidden md:block overflow-hidden rounded-lg border shadow-sm w-full">
        <div className="overflow-x-auto w-full">
          <Table className="text-sm">
            <TableHeader className="bg-muted/80 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="text-nowrap h-12 border-b"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-12 font-semibold text-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    <FormSkeleton />
                  </TableCell>
                </TableRow>
              ) : data.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="text-nowrap hover:bg-muted/70 bg-background cursor-pointer transition-colors border-b"
                    onClick={() => handleRowClick(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="p-3 truncate">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center">
                    No se encontraron inspecciones.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Vista de Cards para móviles */}
      <div className="md:hidden w-full space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <FormSkeleton />
            </CardContent>
          </Card>
        ) : data.length ? (
          table.getRowModel().rows.map((row) => (
            <Card
              key={row.id}
              className="overflow-hidden border-primary/10 hover:border-primary/30 bg-muted/40 transition-colors cursor-pointer"
              onClick={() => handleRowClick(row.original)}
            >
              <CardContent className="p-4 space-y-2">
                {row.getVisibleCells().map((cell) => {
                  const columnDef = cell.column.columnDef;
                  const header =
                    typeof columnDef.header === "string" ? columnDef.header : "";

                  return (
                    <div key={cell.id} className="flex flex-col gap-1">
                      {header && (
                        <span className="text-xs font-medium text-muted-foreground">
                          {header}
                        </span>
                      )}
                      <div className="text-sm">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-muted-foreground">
              No se encontraron inspecciones.
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
