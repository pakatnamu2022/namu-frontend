"use client";

import { ColumnDef, Column } from "@tanstack/react-table";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Download, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LiquidacionBbssConceptColumn,
  LiquidacionBbssPivotRow,
} from "../lib/liquidacion-bbss.interface";
import { LIQUIDACION_BBSS } from "../lib/liquidacion-bbss.constant";
import { downloadLiquidationBbssPayslip } from "../lib/liquidacion-bbss.actions";
import { errorToast } from "@/core/core.function";

const pen = (val: number | null | undefined) =>
  `S/ ${(val ?? 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}`;

type Row = LiquidacionBbssPivotRow;
type Col = ColumnDef<Row>;

// ── Header ordenable (clic = asc → desc → sin orden), mismo patrón que
// PayrollRegisterColumns.tsx para mantener la tabla compacta y consistente ──
function SortableHeader({
  column,
  label,
  align = "left",
}: {
  column: Column<Row, unknown>;
  label: string;
  align?: "left" | "right";
}) {
  const sorted = column.getIsSorted();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={column.getToggleSortingHandler()}
      className={cn(
        "h-6 px-1 gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground w-full",
        align === "right" ? "justify-end -mr-1" : "justify-start -ml-1",
      )}
    >
      <span>{label}</span>
      {sorted === "asc" ? (
        <ArrowUp className="size-3 shrink-0" />
      ) : sorted === "desc" ? (
        <ArrowDown className="size-3 shrink-0" />
      ) : (
        <ArrowUpDown className="size-3 shrink-0 opacity-40" />
      )}
    </Button>
  );
}

const sortableHeader = (label: string, align: "left" | "right" = "left") =>
  function Header({ column }: { column: Column<Row, unknown> }) {
    return <SortableHeader column={column} label={label} align={align} />;
  };

/** Botón "descargar boleta" para un worker+period, si el conjunto de conceptos de la fila
 * incluye CTS y/o gratificación (los únicos dos tipos de boleta que genera el backend). */
function PayslipButtons({ row }: { row: Row }) {
  const hasCts = Object.keys(row.amounts).some((c) => /CTS/i.test(c));
  const hasGrati = Object.keys(row.amounts).some((c) => /GRATIF/i.test(c));

  const handleDownload = async (type: "cts" | "gratificacion") => {
    try {
      const blob = await downloadLiquidationBbssPayslip(
        row.period_id,
        row.worker_id,
        type,
      );
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `boleta-${type}-${row.worker_id}-${row.period_id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      errorToast(
        error?.response?.data?.message ?? "No se pudo generar la boleta.",
      );
    }
  };

  if (!hasCts && !hasGrati) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {hasGrati && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => handleDownload("gratificacion")}
              >
                <Download className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Boleta gratificación</p>
            </TooltipContent>
          </Tooltip>
        )}
        {hasCts && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                onClick={() => handleDownload("cts")}
              >
                <Download className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Boleta CTS</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

/** Genera las columnas de la tabla pivoteada (una fila por trabajador+periodo). `concepts` es
 * la lista de conceptos realmente presentes en los datos del periodo seleccionado (viene del
 * backend, ver PayrollLiquidationBbssService::listPivoted). */
export function liquidacionBbssPivotColumns({
  concepts,
  onDelete,
}: {
  concepts: LiquidacionBbssConceptColumn[];
  onDelete: (id: number) => void;
}): ColumnDef<Row>[] {
  const identity: Col[] = [
    {
      id: "n",
      header: "N°",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.index + 1}</span>
      ),
      size: 44,
      enableSorting: false,
    },
    {
      accessorKey: "worker",
      header: sortableHeader("Trabajador"),
      cell: ({ getValue }) => (
        <span className="font-semibold whitespace-nowrap">
          {(getValue() as string) ?? "—"}
        </span>
      ),
      size: 220,
    },
    {
      accessorKey: "worker_vat",
      header: sortableHeader("DNI"),
      cell: ({ getValue }) => (
        <span className="font-mono text-xs">
          {(getValue() as string) ?? "—"}
        </span>
      ),
      size: 90,
    },
  ];

  const conceptColumns: Col[] = concepts.map(({ code, label }) => ({
    id: code,
    header: sortableHeader(label, "right"),
    accessorFn: (row) => row.amounts[code],
    cell: ({ row }) => {
      const amount = row.original.amounts[code];
      return (
        <span className="font-mono text-xs text-right block">
          {amount !== undefined ? pen(amount) : "—"}
        </span>
      );
    },
    size: 120,
  }));

  const total: Col = {
    accessorKey: "total",
    header: sortableHeader("Total", "right"),
    cell: ({ getValue }) => (
      <span className="font-mono text-xs text-right block font-bold text-emerald-700 dark:text-emerald-400">
        {pen(getValue() as number)}
      </span>
    ),
    size: 110,
  };

  const actions: Col = {
    id: "actions",
    header: "Acciones",
    size: 90,
    enableSorting: false,
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const router = useNavigate();
      const { ROUTE_UPDATE } = LIQUIDACION_BBSS;
      const entries = Object.entries(row.original.ids);

      return (
        <div className="flex items-center gap-2">
          <PayslipButtons row={row.original} />

          {entries.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="size-7">
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {entries.map(([code, id], idx) => {
                  const label =
                    concepts.find((c) => c.code === code)?.label ?? code;
                  return (
                    <div key={id}>
                      {idx > 0 && <DropdownMenuSeparator />}
                      <DropdownMenuItem
                        onClick={() => router(`${ROUTE_UPDATE}/${id}`)}
                      >
                        Editar {label}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete(id)}
                      >
                        Eliminar {label}
                      </DropdownMenuItem>
                    </div>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      );
    },
  };

  return [...identity, ...conceptColumns, total, actions];
}
