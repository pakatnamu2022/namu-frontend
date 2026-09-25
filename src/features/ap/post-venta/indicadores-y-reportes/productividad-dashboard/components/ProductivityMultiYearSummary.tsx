"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatMoney, formatHours } from "@/core/core.function";
import { ProductivityYearComparisonEntry } from "../lib/productivityHistorical.interface";

interface ProductivityMultiYearSummaryProps {
  years: ProductivityYearComparisonEntry[];
}

export default function ProductivityMultiYearSummary({
  years,
}: ProductivityMultiYearSummaryProps) {
  if (years.length === 0) return null;

  return (
    <Card>
      <CardContent className="p-4">
        <p className="mb-3 text-sm font-semibold">Resumen Multi-Anual</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {years.map((entry) => (
            <div
              key={entry.year}
              className="rounded-lg border bg-linear-to-br from-muted to-background p-4"
            >
              <p className="text-sm font-semibold mb-2">{entry.year}</p>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Productividad prom.:</span>
                  <span className="font-bold">
                    {entry.summary.avg_productivity_percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Horas facturadas:</span>
                  <span className="font-bold">
                    {formatHours(entry.summary.total_billed_hours)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Ganancias:</span>
                  <span className="font-bold">
                    {formatMoney(entry.summary.total_earnings)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">OTs cerradas:</span>
                  <span className="font-bold">
                    {entry.summary.total_ots_closed.toLocaleString("es-PE")}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
