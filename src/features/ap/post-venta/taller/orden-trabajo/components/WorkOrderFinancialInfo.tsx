import { TrendingUp } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Progress } from "@/components/ui/progress";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";
import { WorkOrderLabourResource } from "../../orden-trabajo-labor/lib/workOrderLabour.interface";
import { WorkOrderPartsResource } from "../../orden-trabajo-repuesto/lib/workOrderParts.interface";

interface WorkOrderFinancialInfoProps {
  labours: WorkOrderLabourResource[];
  parts: WorkOrderPartsResource[];
  advances: ElectronicDocumentResource[];
  currencySymbol: string;
}

export function WorkOrderFinancialInfo({
  labours,
  parts,
  advances,
  currencySymbol,
}: WorkOrderFinancialInfoProps) {
  // Calcular total de la orden de trabajo desde labours y parts
  const laboursTotal = labours.reduce(
    (sum, labour) => sum + (parseFloat(labour.total_cost || "0")),
    0,
  );

  const partsTotal = parts.reduce(
    (sum, part) => sum + (parseFloat(part.total_amount || "0")),
    0,
  );

  const workOrderTotal = laboursTotal + partsTotal;

  // Calcular total de TODOS los pagos previos
  const totalAdvances = advances.reduce((sum, advance) => {
    if (
      advance.sunat_concept_document_type_id ===
      SUNAT_TYPE_INVOICES_ID.NOTA_CREDITO
    )
      return sum - (Number(advance.total) || 0);
    else if (
      advance.sunat_concept_document_type_id ===
      SUNAT_TYPE_INVOICES_ID.NOTA_DEBITO
    )
      return sum + (Number(advance.total) || 0);
    else return sum + (Number(advance.total) || 0);
  }, 0);

  // Calcular saldo pendiente
  const pendingBalance = workOrderTotal - totalAdvances;

  // Calcular porcentaje de pago
  const paymentPercentage =
    workOrderTotal > 0 ? (totalAdvances / workOrderTotal) * 100 : 0;

  return (
    <GroupFormSection
      title="Resumen de Pagos"
      icon={TrendingUp}
      iconColor="text-primary"
      bgColor="bg-primary/5"
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
              {advances.map((advance) => (
                <div
                  key={advance.id}
                  className="flex items-center justify-between text-xs py-1 px-2 rounded bg-muted/30"
                >
                  <span className="text-foreground">
                    {advance.serie}-{advance.numero}
                  </span>
                  <span className="font-medium text-foreground">
                    {advance.sunat_concept_document_type_id ===
                    SUNAT_TYPE_INVOICES_ID.NOTA_CREDITO
                      ? "- "
                      : ""}
                    {currencySymbol} {Number(advance.total).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </GroupFormSection>
  );
}
