import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileText, Ban, Download } from "lucide-react";
import {
  WorkOrderDocumentsTreeResource,
  WorkOrderDocumentTreeItemResource,
} from "../lib/workOrder.interface";

interface InvoiceListProps {
  vouchers: WorkOrderDocumentsTreeResource;
  currencySymbol: string;
  totalAmount: number;
}

interface InvoiceRowProps {
  invoice: WorkOrderDocumentTreeItemResource;
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
              {invoice.number}
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
                  {invoice.status === "accepted" ? "Aceptado" : "Pendiente"}
                </Badge>
                {Boolean(invoice.is_advance_payment) && (
                  <Badge variant="default" color="secondary">
                    Anticipo
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            {invoice.issue_date && (
              <p className="text-xs text-gray-500">{invoice.issue_date}</p>
            )}
            <span className="text-xs text-gray-300">•</span>
            <p className="text-xs text-gray-500">{invoice.document_type}</p>
            {invoice.client_name && (
              <>
                <span className="text-xs text-gray-300">•</span>
                <p className="text-xs text-gray-500">{invoice.client_name}</p>
              </>
            )}
          </div>
          {cancelled &&
            invoice.modifications &&
            invoice.modifications.length > 0 && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-gray-400">
                  {invoice.modifications[0].type === "credit_note"
                    ? "Nota de crédito:"
                    : "Nota de débito:"}
                </span>
                <span className="text-xs font-medium text-gray-500">
                  {invoice.modifications[0].number}
                </span>
              </div>
            )}
          {cancelled &&
            (!invoice.modifications || invoice.modifications.length === 0) && (
              <span className="text-xs text-gray-400 italic">
                Anulada sin nota de crédito/débito
              </span>
            )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <p
          className={`font-bold text-sm ${
            cancelled ? "line-through text-gray-400" : "text-primary"
          }`}
        >
          {currencySymbol} {Number(invoice.total).toFixed(2)}
        </p>
        {invoice.enlace_del_pdf && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            tooltip="Descargar PDF"
            asChild
          >
            <a
              href={invoice.enlace_del_pdf}
              target="_blank"
              rel="noopener noreferrer"
              download
            >
              <Download className="h-4 w-4 text-gray-500" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}

export default function InvoiceList({
  vouchers,
  currencySymbol,
  totalAmount,
}: InvoiceListProps) {
  const active = vouchers.active;
  const cancelled = vouchers.cancelled;
  const hasAny = active.length > 0 || cancelled.length > 0;

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

  const totalBilled = active.reduce(
    (sum, doc) => sum + Number(doc.net_amount ?? doc.total),
    0,
  );
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
      {active.length > 0 && (
        <div className="space-y-2">
          {active.map((doc) => (
            <InvoiceRow
              key={doc.id}
              invoice={doc}
              currencySymbol={currencySymbol}
            />
          ))}
        </div>
      )}

      {/* Facturas anuladas */}
      {cancelled.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 pt-2 border-t">
            <Ban className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
              Anuladas ({cancelled.length})
            </span>
          </div>
          {cancelled.map((doc) => (
            <InvoiceRow
              key={doc.id}
              invoice={doc}
              currencySymbol={currencySymbol}
              cancelled
            />
          ))}
        </div>
      )}
    </div>
  );
}
