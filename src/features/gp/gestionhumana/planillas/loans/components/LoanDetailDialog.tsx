"use client";

import { useQuery } from "@tanstack/react-query";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { findLoanById } from "../lib/loan.actions";
import { LoanExtraDiscountResource } from "../lib/loan.interface";
import { Badge } from "@/components/ui/badge";

interface LoanDetailDialogProps {
  loanId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getPaymentLabel(
  discount: LoanExtraDiscountResource,
  installmentsCount: number | null,
  loanAmount: number,
): string {
  if ((installmentsCount === 1 || installmentsCount === null) && discount.amount >= loanAmount)
    return "Pago directo";
  return discount.month_number != null
    ? `Cuota #${discount.month_number}`
    : "Cuota";
}

export function LoanDetailDialog({
  loanId,
  open,
  onOpenChange,
}: LoanDetailDialogProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["loan-detail", loanId],
    queryFn: () => findLoanById(loanId),
    enabled: open,
  });

  const extraDiscounts: LoanExtraDiscountResource[] =
    data?.extra_discounts ?? [];
  const loanAmount = Number(data?.loan_amount ?? 0);
  const installmentsCount = data?.installments_count ?? null;
  const remainingBalance = Number(data?.remaining_balance ?? 0);
  const totalPagado = extraDiscounts.reduce(
    (sum, d) => sum + Number(d.amount),
    0,
  );
  const paymentDays = data?.payment_days ?? [];

  return (
    <GeneralSheet
      open={open}
      onClose={() => onOpenChange(false)}
      title="Detalle de pagos"
      subtitle="Historial de pagos registrados para este préstamo."
      icon="Eye"
      size="3xl"
      isLoading={isLoading}
    >
      <div className="space-y-4 py-2">
        <div className="grid grid-cols-2 gap-3 rounded-lg border bg-muted/40 p-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-muted-foreground">Monto préstamo</p>
            <p className="font-mono font-semibold">
              S/{" "}
              {loanAmount.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Total pagado</p>
            <p className="font-mono font-semibold text-green-600">
              S/{" "}
              {totalPagado.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Saldo pendiente</p>
            <p
              className={`font-mono font-semibold ${remainingBalance > 0 ? "text-destructive" : "text-green-600"}`}
            >
              S/{" "}
              {remainingBalance.toLocaleString("es-PE", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Días de descuento</p>
            {paymentDays.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-0.5">
                {paymentDays.map((d) => (
                  <Badge key={d} variant="outline" className="font-mono text-xs px-1.5 py-0">
                    {d}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">—</p>
            )}
          </div>
        </div>

        {extraDiscounts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No hay pagos registrados aún.
          </p>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Concepto
                  </th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                    Tipo
                  </th>
                  <th className="px-3 py-2 text-right font-medium text-muted-foreground">
                    Monto
                  </th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {extraDiscounts.map((d) => (
                  <tr key={d.id} className="hover:bg-muted/20">
                    <td className="px-3 py-2">{d.concept_type ?? "—"}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {getPaymentLabel(d, installmentsCount, loanAmount)}
                    </td>
                    <td className="px-3 py-2 text-right font-mono">
                      S/{" "}
                      {Number(d.amount).toLocaleString("es-PE", {
                        minimumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <Badge variant={d.applied ? "default" : "outline"}>
                        {d.applied ? "Aplicado" : "Pendiente"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </GeneralSheet>
  );
}
