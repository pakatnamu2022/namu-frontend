import { TrendingUp } from "lucide-react";
import { GroupFormSection } from "@/shared/components/GroupFormSection";
import { Progress } from "@/components/ui/progress";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import { SUNAT_TYPE_INVOICES_ID } from "@/features/gp/maestro-general/conceptos-sunat/lib/sunatConcepts.constants";

interface OrderQuotationFinancialInfoProps {
  quotation: OrderQuotationResource;
  advances: ElectronicDocumentResource[];
  currencySymbol: string;
}

export function OrderQuotationFinancialInfo({
  quotation,
  advances,
  currencySymbol,
}: OrderQuotationFinancialInfoProps) {
  // Calcular total de la cotización desde OrderQuotationResource
  const quotationTotal = quotation.total_amount || 0;

  // Calcular total de TODOS los pagos previos (para mostrar en el progreso)
  // Esto incluye tanto anticipos (is_advance_payment = true) como ventas internas completas (is_advance_payment = false)
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
  const pendingBalance = quotationTotal - totalAdvances;

  // Calcular porcentaje de pago
  const paymentPercentage =
    quotationTotal > 0 ? (totalAdvances / quotationTotal) * 100 : 0;

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
