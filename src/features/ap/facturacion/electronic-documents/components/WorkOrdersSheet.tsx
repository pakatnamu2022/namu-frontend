import { useState } from "react";
import { ClipboardList, Package, Wrench } from "lucide-react";
import GeneralSheet from "@/shared/components/GeneralSheet";
import { ButtonAction } from "@/shared/components/ButtonAction";
import { getInvoiceWithWorkOrders } from "../lib/electronicDocument.actions";
import type { InvoiceWithWorkOrdersResponse } from "../lib/electronicDocument.interface";

interface WorkOrdersSheetProps {
  documentId: number;
}

const WorkOrdersSheet = ({ documentId }: WorkOrdersSheetProps) => {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<InvoiceWithWorkOrdersResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const formatMoney = (value: number | string, symbol: string) =>
    `${symbol} ${Number(value).toLocaleString("es-PE", {
      minimumFractionDigits: 2,
    })}`;

  const formatShortDate = (value: string) =>
    new Date(value).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const getStatusClasses = (status: string) => {
    const normalized = status.toLowerCase();
    if (normalized.includes("cerr"))
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (normalized.includes("pend"))
      return "bg-amber-50 text-amber-700 border-amber-200";
    if (normalized.includes("anul") || normalized.includes("cancel"))
      return "bg-rose-50 text-rose-700 border-rose-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  const handleOpen = async () => {
    setOpen(true);
    setIsLoading(true);
    try {
      const result = await getInvoiceWithWorkOrders(documentId);
      setData(result);
    } catch (error) {
      console.error("Error fetching work orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ButtonAction
        tooltip="Ver órdenes de trabajo"
        icon={ClipboardList}
        color="indigo"
        onClick={handleOpen}
      />

      <GeneralSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Órdenes de Trabajo"
        subtitle={
          data
            ? `${data.invoice.full_number} — ${data.invoice.client_name}`
            : `Documento #${documentId}`
        }
        icon="ClipboardList"
        size="3xl"
        isLoading={isLoading}
      >
        {data && (
          <div className="flex flex-col gap-3">
            {/* Resumen */}
            <div className="grid grid-cols-3 divide-x divide-border rounded-xl border bg-muted/30">
              <div className="px-4 py-2.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Notas internas
                </p>
                <p className="text-lg font-semibold">
                  {data.summary.total_internal_notes}
                </p>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Órdenes de trabajo
                </p>
                <p className="text-lg font-semibold">
                  {data.summary.total_work_orders}
                </p>
              </div>
              <div className="px-4 py-2.5">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  Total consolidado
                </p>
                <p className="text-lg font-semibold">
                  {formatMoney(
                    data.summary.total_amount,
                    data.invoice.currency === "Soles" ? "S/" : "$",
                  )}
                </p>
              </div>
            </div>

            {/* Notas internas */}
            <div className="flex flex-col gap-2">
              {data.internal_notes.map((note) => {
                const workOrder = note.work_order;
                const currencySymbol = workOrder.type_currency?.symbol ?? "S/";
                const labourItems = workOrder.labours ?? [];
                const partItems = workOrder.parts ?? [];

                return (
                  <div
                    key={note.id}
                    className="rounded-xl border bg-background shadow-sm"
                  >
                    {/* Header de la nota */}
                    <div className="flex items-center justify-between gap-3 border-b px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="size-3.5 shrink-0 text-muted-foreground" />
                        <span className="text-sm font-semibold">
                          {note.number}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · OT {workOrder.correlative}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {formatShortDate(note.created_date)}
                          {note.closed_date
                            ? ` → ${formatShortDate(note.closed_date)}`
                            : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex gap-1.5 text-[11px] text-muted-foreground">
                          <span className="rounded border bg-muted/40 px-1.5 py-0.5">
                            {labourItems.length} labores
                          </span>
                          <span className="rounded border bg-muted/40 px-1.5 py-0.5">
                            {partItems.length} repuestos
                          </span>
                        </div>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusClasses(workOrder.status.description)}`}
                        >
                          {workOrder.status.description}
                        </span>
                      </div>
                    </div>

                    {/* Cuerpo: labores + repuestos en dos columnas */}
                    <div className="grid grid-cols-2 divide-x divide-border">
                      {/* Labores */}
                      <div className="flex flex-col p-3">
                        <div className="mb-2 flex items-center gap-1.5">
                          <Wrench className="size-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Labores
                          </span>
                        </div>
                        {labourItems.length > 0 ? (
                          <>
                            <div className="divide-y divide-border/50">
                              {labourItems.map((labour) => (
                                <div
                                  key={labour.id}
                                  className="flex items-baseline justify-between gap-2 py-1.5"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm">
                                      {labour.description}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {labour.time_spent_decimal}h ·{" "}
                                      {formatMoney(
                                        labour.hourly_rate,
                                        currencySymbol,
                                      )}
                                      /h
                                      {Number(labour.discount_percentage) > 0 &&
                                        ` · −${labour.discount_percentage}%`}
                                    </p>
                                  </div>
                                  <span className="shrink-0 text-sm font-semibold">
                                    {formatMoney(
                                      labour.net_amount || labour.total_cost,
                                      currencySymbol,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 flex justify-end border-t pt-1.5">
                              <span className="text-[11px] text-muted-foreground">
                                Subtotal labores{" "}
                                <span className="font-semibold text-foreground">
                                  {formatMoney(
                                    labourItems.reduce(
                                      (acc, l) =>
                                        acc +
                                        Number(
                                          l.net_amount || l.total_cost || 0,
                                        ),
                                      0,
                                    ),
                                    currencySymbol,
                                  )}
                                </span>
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="py-2 text-xs text-muted-foreground">
                            Sin labores registradas.
                          </p>
                        )}
                      </div>

                      {/* Repuestos */}
                      <div className="flex flex-col p-3">
                        <div className="mb-2 flex items-center gap-1.5">
                          <Package className="size-3.5 text-muted-foreground" />
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Repuestos
                          </span>
                        </div>
                        {partItems.length > 0 ? (
                          <>
                            <div className="divide-y divide-border/50">
                              {partItems.map((part) => (
                                <div
                                  key={part.id}
                                  className="flex items-baseline justify-between gap-2 py-1.5"
                                >
                                  <div className="min-w-0">
                                    <p className="truncate text-sm">
                                      {part.product_name}
                                    </p>
                                    <p className="text-[11px] text-muted-foreground">
                                      {part.quantity_used} unid. ·{" "}
                                      {formatMoney(
                                        part.unit_price ?? 0,
                                        currencySymbol,
                                      )}
                                      /u
                                      {Number(part.discount_percentage) > 0 &&
                                        ` · −${part.discount_percentage}%`}
                                    </p>
                                  </div>
                                  <span className="shrink-0 text-sm font-semibold">
                                    {formatMoney(
                                      part.net_amount ?? part.total_cost ?? 0,
                                      currencySymbol,
                                    )}
                                  </span>
                                </div>
                              ))}
                            </div>
                            <div className="mt-2 flex justify-end border-t pt-1.5">
                              <span className="text-[11px] text-muted-foreground">
                                Subtotal repuestos{" "}
                                <span className="font-semibold text-foreground">
                                  {formatMoney(
                                    partItems.reduce(
                                      (acc, p) =>
                                        acc +
                                        Number(
                                          p.net_amount ?? p.total_cost ?? 0,
                                        ),
                                      0,
                                    ),
                                    currencySymbol,
                                  )}
                                </span>
                              </span>
                            </div>
                          </>
                        ) : (
                          <p className="py-2 text-xs text-muted-foreground">
                            Sin repuestos registrados.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Footer: totales */}
                    <div className="flex items-center justify-end gap-4 border-t bg-muted/20 px-4 py-2">
                      <span className="text-xs text-muted-foreground">
                        Subtotal{" "}
                        <span className="font-medium text-foreground">
                          {formatMoney(workOrder.subtotal, currencySymbol)}
                        </span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        IGV{" "}
                        <span className="font-medium text-foreground">
                          {formatMoney(workOrder.tax_amount, currencySymbol)}
                        </span>
                      </span>
                      <span className="text-sm font-semibold">
                        {formatMoney(workOrder.final_amount, currencySymbol)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </GeneralSheet>
    </>
  );
};

export default WorkOrdersSheet;
