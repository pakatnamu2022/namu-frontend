import { TrendingUp } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Progress } from "@/components/ui/progress";
import { ActiveDocument, WorkOrderResource } from "../lib/workOrder.interface";

interface WorkOrderFinancialInfoProps {
  advances: ActiveDocument[];
  currencySymbol: string;
  paymentSummary: WorkOrderResource["payment_summary"];
}

export function WorkOrderFinancialInfo({
  advances,
  currencySymbol,
  paymentSummary,
}: WorkOrderFinancialInfoProps) {
  const totalAdvances = paymentSummary.paid_amount;
  const pendingBalance = paymentSummary.remaining_balance;
  const workOrderTotal = totalAdvances + pendingBalance;
  const paymentPercentage = paymentSummary.payment_percentage;

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
              {currencySymbol} {totalAdvances.toFixed(2)}
            </span>
            <span>
              {currencySymbol} {workOrderTotal.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Resumen Financiero */}
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-lg font-bold text-primary">
              {currencySymbol} {workOrderTotal.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Pagado
              {advances.length > 0 && (
                <span className="ml-1.5 text-xs bg-tertiary/40 text-secondary-foreground px-1.5 py-0.5 rounded">
                  {advances.length}
                </span>
              )}
            </p>
            <p className="text-lg font-bold text-tertiary">
              {currencySymbol} {totalAdvances.toFixed(2)}
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
        {advances.length > 0 && (
          <div className="space-y-2 pt-4 border-t">
            <p className="text-xs font-medium text-muted-foreground">
              Pagos aplicados
            </p>
            <div className="space-y-1">
              {advances.map((doc) => (
                <div
                  key={doc.id}
                  className="p-2 rounded bg-muted/20 border border-muted space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {doc.serie}-{doc.numero}
                    </span>
                    <span className="text-xs font-bold text-foreground">
                      {currencySymbol} {Number(doc.total).toFixed(2)}
                    </span>
                  </div>
                  {doc.client_name && (
                    <div className="text-xs text-muted-foreground">
                      <p className="font-medium">{doc.client_name}</p>
                      <p>RUC: {doc.client_document}</p>
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
