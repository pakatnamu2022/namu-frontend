"use client";

import { useMemo, useState } from "react";
import { SummaryWorkerItem } from "../lib/payroll-calculation.interface";
import { ChevronDown, ChevronRight, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Props {
  summary: SummaryWorkerItem[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "PEN",
    minimumFractionDigits: 2,
  }).format(value);
}

function WorkerRow({ worker }: { worker: SummaryWorkerItem }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className="border-b hover:bg-muted/30 transition-colors">
        <td className="px-4 py-2">
          <Button
            variant="ghost"
            size="icon"
            className="size-6 mr-1"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Colapsar" : "Expandir"}
          >
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>
        </td>
        <td className="px-4 py-2 font-medium">{worker.worker_name}</td>
        <td className="px-4 py-2 text-right text-muted-foreground text-sm">
          {formatCurrency(worker.salary)}
        </td>
        <td className="px-4 py-2 text-right text-sm">{worker.shift_hours}h</td>
        <td className="px-4 py-2 text-right text-sm">
          {formatCurrency(worker.base_hour_value)}
        </td>
        <td className="px-4 py-2 text-right font-semibold text-green-700 dark:text-green-400">
          {formatCurrency(worker.total_amount)}
        </td>
      </tr>
      {expanded &&
        worker.details.map((detail, idx) => (
          <tr key={idx} className="bg-muted/20 text-sm border-b border-dashed">
            <td />
            <td className="px-4 py-1.5 pl-10 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {detail.code}
                </Badge>
                {detail.hour_type && (
                  <span className="text-xs text-muted-foreground">
                    {detail.hour_type}
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-1.5 text-right text-muted-foreground">
              {detail.days_worked} días × {detail.hours}h
            </td>
            <td className="px-4 py-1.5 text-right text-muted-foreground">
              ×{detail.multiplier}
            </td>
            <td className="px-4 py-1.5 text-right text-muted-foreground">
              {formatCurrency(detail.hour_value)}/h
            </td>
            <td
              className={`px-4 py-1.5 text-right font-medium ${
                detail.pay
                  ? "text-green-700 dark:text-green-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {detail.pay ? "+" : "-"}
              {formatCurrency(Math.abs(detail.total))}
            </td>
          </tr>
        ))}
    </>
  );
}

export default function PayrollCalculationSummaryTable({ summary }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return summary;
    return summary.filter((w) => w.worker_name.toLowerCase().includes(q));
  }, [summary, search]);

  if (!summary || summary.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        No hay datos de resumen para este período.
      </div>
    );
  }

  const grandTotal = summary.reduce((acc, w) => acc + w.total_amount, 0);

  return (
    <div className="space-y-3">
      <div className="relative w-full max-w-xs">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8 h-8 text-sm"
        />
      </div>

      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="px-4 py-2 w-8" />
              <th className="px-4 py-2 text-left font-semibold">Trabajador</th>
              <th className="px-4 py-2 text-right font-semibold">Sueldo</th>
              <th className="px-4 py-2 text-right font-semibold">Jornada</th>
              <th className="px-4 py-2 text-right font-semibold">Valor/Hora</th>
              <th className="px-4 py-2 text-right font-semibold">Total Neto</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                  Sin resultados para &quot;{search}&quot;
                </td>
              </tr>
            ) : (
              filtered.map((worker) => (
                <WorkerRow key={worker.worker_id} worker={worker} />
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="border-t bg-muted/50">
              <td colSpan={5} className="px-4 py-2 text-right font-semibold">
                Total General ({summary.length} trabajadores)
              </td>
              <td className="px-4 py-2 text-right font-bold text-green-700 dark:text-green-400">
                {formatCurrency(grandTotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
