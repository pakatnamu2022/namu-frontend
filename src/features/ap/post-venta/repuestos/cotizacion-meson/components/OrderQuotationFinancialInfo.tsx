"use client";

import { useEffect } from "react";
import { TrendingUp } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Progress } from "@/components/ui/progress";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";

interface OrderQuotationFinancialInfoProps {
  quotation: OrderQuotationResource;
  currencySymbol: string;
  onClientIdDetected?: (
    clientId: number | null,
    clientName?: string,
    clientDoc?: string,
  ) => void;
}

export function OrderQuotationFinancialInfo({
  quotation,
  currencySymbol,
  onClientIdDetected,
}: OrderQuotationFinancialInfoProps) {
  const summary = quotation.payment_summary;
  const quotationTotal = quotation.total_amount || 0;
  const paidAmount = summary?.paid_amount ?? 0;
  const pendingBalance = summary?.remaining_balance ?? quotationTotal;
  const paymentPercentage = summary?.payment_percentage ?? 0;

  const activeVouchers = quotation.vouchers?.active ?? [];
  const advanceVouchers = activeVouchers.filter((v) => v.is_advance_payment);

  // Notificar client_id: ActiveDocument no expone client_id numérico,
  // así que se notifica null para no bloquear el selector cuando hay anticipos.
  useEffect(() => {
    if (!onClientIdDetected) return;
    onClientIdDetected(null);
  }, [advanceVouchers.length, onClientIdDetected]);

  return (
    <GroupFormSection
      title="Resumen de Pagos"
      icon={TrendingUp}
      color="primary"
      cols={{ sm: 1 }}
    >
      <div className="space-y-6">
        {/* Progress Bar Principal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Progreso de Pago
            </span>
            <span className="text-sm font-semibold text-primary">
              {paymentPercentage.toFixed(1)}%
            </span>
          </div>
          <Progress value={paymentPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>
              {currencySymbol} {paidAmount.toFixed(2)}
            </span>
            <span>
              {currencySymbol} {quotationTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-primary">
              {currencySymbol} {quotationTotal.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Pagado
              {advanceVouchers.length > 0 && (
                <span className="ml-1.5 text-xs bg-tertiary/40 text-secondary-foreground px-1.5 py-0.5 rounded">
                  {advanceVouchers.length}
                </span>
              )}
            </p>
            <p className="text-lg font-bold text-tertiary">
              {currencySymbol} {paidAmount.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Pendiente</p>
            <p
              className={`text-lg font-bold ${
                pendingBalance > 0 ? "text-secondary" : "text-muted-foreground"
              }`}
            >
              {currencySymbol} {pendingBalance.toFixed(2)}
            </p>
            {pendingBalance <= 0 && (
              <p className="text-xs text-muted-foreground">Completado</p>
            )}
          </div>
        </div>

        {/* Lista de Pagos */}
        {activeVouchers.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Pagos aplicados
            </p>
            <div className="space-y-2">
              {activeVouchers.map((voucher) => (
                <div
                  key={voucher.id}
                  className="p-2 rounded bg-muted/20 border border-muted space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {voucher.serie}-{voucher.numero}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {currencySymbol} {Number(voucher.total).toFixed(2)}
                    </span>
                  </div>
                  {voucher.client_name && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">{voucher.client_name}</p>
                      <p>{voucher.client_document}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GroupFormSection>
  );
}
