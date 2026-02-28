import { useState, useCallback } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ChevronDown, Columns, ScanSearch } from "lucide-react";
import { useReactTable } from "@tanstack/react-table";

type Column = ReturnType<ReturnType<typeof useReactTable>["getAllColumns"]>[number];

export default function DataTableColumnFilter<TData>({
  table,
  tableContainerRef,
}: {
  table: ReturnType<typeof useReactTable<TData>>;
  tableContainerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const getColumnLabel = (column: Column) =>
    (column.columnDef.meta as { title?: string })?.title ??
    (typeof column.columnDef.header === "string"
      ? column.columnDef.header
      : column.id);

  const allColumns = table
    .getAllColumns()
    .filter(
      (column) =>
        typeof column.accessorFn !== "undefined" && column.getCanHide(),
    );

  const filteredColumns = search.trim()
    ? allColumns.filter((column) =>
        getColumnLabel(column).toLowerCase().includes(search.toLowerCase()),
      )
    : allColumns;

  const scrollToColumn = useCallback(
    (columnId: string) => {
      const container = tableContainerRef?.current;
      if (!container) return;

      const doScroll = () => {
        const th = container.querySelector<HTMLElement>(
          `[data-column-id="${columnId}"]`,
        );
        if (!th) return;

        const containerRect = container.getBoundingClientRect();
        const thRect = th.getBoundingClientRect();
        const targetScrollLeft =
          container.scrollLeft +
          thRect.left -
          containerRect.left -
          containerRect.width / 2 +
          th.offsetWidth / 2;

        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior: "smooth",
        });
      };

      // Defer para que React renderice la columna si estaba oculta
      setTimeout(doScroll, 50);
    },
    [tableContainerRef],
  );

  const handleLocate = (column: Column) => {
    if (!column.getIsVisible()) {
      column.toggleVisibility(true);
    }
    scrollToColumn(column.id);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Columns />
          <span className="hidden lg:inline">Mostrar columnas</span>
          <span className="lg:hidden">Columnas</span>
          <ChevronDown />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-0">
        <div className="p-2 border-b">
          <Input
            placeholder="Buscar columna..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-7 text-xs"
          />
        </div>
        <div className="max-h-64 overflow-y-auto py-1">
          {filteredColumns.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground text-center">
              Sin resultados
            </div>
          ) : (
            filteredColumns.map((column) => (
              <div
                key={column.id}
                className="flex items-center gap-2 px-2 py-1.5 rounded-sm mx-1 hover:bg-accent group cursor-default"
              >
                <Checkbox
                  id={`col-${column.id}`}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) =>
                    column.toggleVisibility(!!value)
                  }
                />
                <label
                  htmlFor={`col-${column.id}`}
                  className="flex-1 text-sm capitalize cursor-pointer truncate select-none"
                >
                  {getColumnLabel(column)}
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Ir a columna"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLocate(column);
                  }}
                >
                  <ScanSearch className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
