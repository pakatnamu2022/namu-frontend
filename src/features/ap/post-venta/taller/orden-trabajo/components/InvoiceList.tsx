import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Ban } from "lucide-react";
import { ElectronicDocumentResource } from "@/features/ap/facturacion/electronic-documents/lib/electronicDocument.interface";
import { WorkOrderPaymentSummary } from "../lib/workOrder.interface";
import { formatDate } from "@/core/core.function";

interface InvoiceListProps {
  advances: ElectronicDocumentResource[];
  advancesCancelled: ElectronicDocumentResource[];
  currencySymbol: string;
  paymentSummary?: WorkOrderPaymentSummary;
}

interface InvoiceRowProps {
  invoice: ElectronicDocumentResource;
  currencySymbol: string;
  cancelled?: boolean;
}

function InvoiceRow({
  invoice,
  currencySymbol,
  cancelled = false,
}: InvoiceRowProps) {
  return (
    <div
      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
        cancelled
          ? "bg-gray-50 border-gray-200 opacity-60"
          : "bg-white hover:bg-gray-50"
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        {cancelled && <Ban className="h-4 w-4 text-gray-400 shrink-0" />}
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className={`font-semibold text-sm ${
                cancelled ? "line-through text-gray-400" : "text-gray-900"
              }`}
            >
              {invoice.full_number}
            </p>
            {cancelled ? (
              <Badge
                variant="outline"
                className="text-gray-400 border-gray-300 text-xs"
              >
                Anulada
              </Badge>
            ) : (
              <>
                <Badge variant="default">
                  {invoice.sunat_responsecode === "0"
                    ? "Aceptado"
                    : "Pendiente"}
                </Badge>
                {invoice.is_advance_payment && (
                  <Badge variant="default" color="secondary">
                    Anticipo
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-xs text-gray-500">
              {formatDate(invoice.fecha_de_emision)}
            </p>
            <span className="text-xs text-gray-300">•</span>
            <p className="text-xs text-gray-500">
              {invoice.document_type?.description}
            </p>
          </div>
          {cancelled && (
            <div className="flex items-center gap-1 mt-0.5">
              {invoice.credit_note_id != null ? (
                <>
                  <span className="text-xs text-gray-400">
                    Nota de crédito:
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    {invoice.credit_note_number}
                  </span>
                </>
              ) : invoice.debit_note_id != null ? (
                <>
                  <span className="text-xs text-gray-400">Nota de débito:</span>
                  <span className="text-xs font-medium text-gray-500">
                    {invoice.debit_note_number}
                  </span>
                </>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  Anulada sin nota de crédito/débito
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="text-right">
        <p
          className={`font-bold text-sm ${
            cancelled ? "line-through text-gray-400" : "text-primary"
          }`}
        >
          {currencySymbol} {Number(invoice.total).toFixed(2)}
        </p>
      </div>
    </div>
  );
}

export default function InvoiceList({
  advances,
  advancesCancelled,
  currencySymbol,
  paymentSummary,
}: InvoiceListProps) {
  const hasAny = advances.length > 0 || advancesCancelled.length > 0;

  if (!hasAny) {
    return (
      <div className="text-center py-6">
        <FileText className="h-10 w-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-1">
          No hay facturas para este grupo
        </p>
        <p className="text-xs text-gray-500">
          Crea la primera factura haciendo clic en "Nueva Factura"
        </p>
      </div>
    );
  }

  const totalBilled = advances.reduce((sum, adv) => sum + Number(adv.total), 0);
  const totalAmount = paymentSummary?.payment_summary.total_amount ?? 0;
  const progressPercent =
    totalAmount > 0 ? (totalBilled / totalAmount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Barra de Progreso */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">
            Progreso de Facturación
          </span>
          <span className="text-sm font-semibold text-primary">
            {progressPercent.toFixed(1)}%
          </span>
        </div>
        <Progress value={progressPercent} className="h-3" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {currencySymbol} {totalBilled.toFixed(2)}
          </span>
          <span>
            {currencySymbol} {totalAmount.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Facturas emitidas vigentes */}
      {advances.length > 0 && (
        <div className="space-y-2">
          {advances.map((advance) => (
            <InvoiceRow
              key={advance.id}
              invoice={advance}
              currencySymbol={currencySymbol}
            />
          ))}
        </div>
      )}

      {/* Facturas anuladas */}
      {advancesCancelled.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 pt-2 border-t">
            <Ban className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Anuladas ({advancesCancelled.length})
            </span>
          </div>
          {advancesCancelled.map((invoice) => (
            <InvoiceRow
              key={invoice.id}
              invoice={invoice}
              currencySymbol={currencySymbol}
              cancelled
            />
          ))}
        </div>
      )}
    </div>
  );
}
