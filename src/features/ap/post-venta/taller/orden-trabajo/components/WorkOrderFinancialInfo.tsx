import { TrendingUp } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Progress } from "@/components/ui/progress";
import { ActiveDocument } from "../lib/workOrder.interface";
import { WorkOrderLabourResource } from "../../orden-trabajo-labor/lib/workOrderLabour.interface";
import { WorkOrderPartsResource } from "../../orden-trabajo-repuesto/lib/workOrderParts.interface";

interface WorkOrderFinancialInfoProps {
  labours: WorkOrderLabourResource[];
  parts: WorkOrderPartsResource[];
  advances: ActiveDocument[];
  currencySymbol: string;
  porcentaje_de_igv: number;
  isInvalidWithQuote?: boolean;
  finalAmount?: number;
}

export function WorkOrderFinancialInfo({
  labours,
  parts,
  advances,
  currencySymbol,
  porcentaje_de_igv,
  isInvalidWithQuote = false,
  finalAmount,
}: WorkOrderFinancialInfoProps) {
  const laboursTotal = labours.reduce(
    (sum, labour) => sum + labour.net_amount,
    0,
  );

  const partsTotal = parts.reduce((sum, part) => sum + part.net_amount, 0);

  const subtotal = laboursTotal + partsTotal;
  const igvAmount = subtotal * (porcentaje_de_igv / 100);
  const workOrderTotal =
    isInvalidWithQuote && finalAmount ? finalAmount : subtotal + igvAmount;

  // Las notas de crédito vienen como modifications con type "credit_note" → restan
  const totalAdvances = advances.reduce((sum, doc) => {
    const creditNoteTotal = (doc.modifications ?? [])
      .filter((m) => m.type === "credit_note")
      .reduce((s: number, m) => s + Number(m.total), 0);
    return sum + Number(doc.total) - creditNoteTotal;
  }, 0);

  const pendingBalance = workOrderTotal - totalAdvances;
  const paymentPercentage =
    workOrderTotal > 0 ? (totalAdvances / workOrderTotal) * 100 : 0;

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
