"use client";

import { GeneralModal } from "@/shared/components/GeneralModal";
import { SummaryWorkerItem } from "../lib/payroll-calculation.interface";
import { Badge } from "@/components/ui/badge";

interface Props {
  open: boolean;
  onClose: () => void;
  worker: SummaryWorkerItem | null;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-SV", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function PayrollCalculationDetailModal({
  open,
  onClose,
  worker,
}: Props) {
  if (!worker) return null;

  return (
    <GeneralModal
      open={open}
      onClose={onClose}
      title={`Detalle - ${worker.worker_name}`}
      subtitle={`Sueldo: ${formatCurrency(worker.salary)} | Jornada: ${worker.shift_hours}h | Valor hora base: ${formatCurrency(worker.base_hour_value)}`}
      size="3xl"
      icon="Calculator"
    >
      <div className="space-y-4">
        <div className="overflow-x-auto rounded-md border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50 border-b">
                <th className="px-3 py-2 text-left font-semibold">Código</th>
                <th className="px-3 py-2 text-left font-semibold">Tipo hora</th>
                <th className="px-3 py-2 text-right font-semibold">Horas/día</th>
                <th className="px-3 py-2 text-right font-semibold">Días</th>
                <th className="px-3 py-2 text-right font-semibold">Multiplicador</th>
                <th className="px-3 py-2 text-right font-semibold">Valor/Hora</th>
                <th className="px-3 py-2 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {worker.details.map((detail, idx) => (
                <tr key={idx} className="border-b hover:bg-muted/30">
                  <td className="px-3 py-2">
                    <Badge variant="outline" className="text-xs">
                      {detail.code}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {detail.hour_type ?? "-"}
                  </td>
                  <td className="px-3 py-2 text-right">{detail.hours}h</td>
                  <td className="px-3 py-2 text-right">{detail.days_worked}</td>
                  <td className="px-3 py-2 text-right">×{detail.multiplier}</td>
                  <td className="px-3 py-2 text-right text-muted-foreground">
                    {formatCurrency(detail.hour_value)}
                  </td>
                  <td
                    className={`px-3 py-2 text-right font-semibold ${
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
            </tbody>
            <tfoot>
              <tr className="border-t bg-muted/50">
                <td colSpan={6} className="px-3 py-2 text-right font-semibold">
                  Total Neto
                </td>
                <td className="px-3 py-2 text-right font-bold text-green-700 dark:text-green-400">
                  {formatCurrency(worker.total_amount)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </GeneralModal>
  );
}
