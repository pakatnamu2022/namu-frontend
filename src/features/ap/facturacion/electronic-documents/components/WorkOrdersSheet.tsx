import { useState } from "react";
import { ClipboardList } from "lucide-react";
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

  const handleOpen = async () => {
    setOpen(true);
    setIsLoading(true);
    try {
      const result = await getInvoiceWithWorkOrders(documentId);
      console.log("WorkOrders data:", result);
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
          <div className="flex flex-col gap-4 py-2">
            {/* Resumen */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border bg-muted/40 p-3 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Notas internas
                </span>
                <span className="text-lg font-bold">
                  {data.summary.total_internal_notes}
                </span>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Órdenes de trabajo
                </span>
                <span className="text-lg font-bold">
                  {data.summary.total_work_orders}
                </span>
              </div>
              <div className="rounded-lg border bg-muted/40 p-3 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  Total consolidado
                </span>
                <span className="text-lg font-bold">
                  {data.invoice.currency === "Soles" ? "S/" : "$"}{" "}
                  {Number(data.summary.total_amount).toLocaleString("es-PE", {
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Lista de notas internas */}
            <div className="flex flex-col gap-2">
              {data.internal_notes.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border p-4 flex flex-col gap-3"
                >
                  {/* Cabecera nota interna */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ClipboardList className="size-4 text-muted-foreground" />
                      <span className="font-semibold text-sm">
                        {note.number}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        Creado:{" "}
                        {new Date(note.created_date).toLocaleDateString(
                          "es-PE",
                          { day: "2-digit", month: "short", year: "numeric" },
                        )}
                      </span>
                      {note.closed_date && (
                        <span>
                          Cerrado:{" "}
                          {new Date(note.closed_date).toLocaleDateString(
                            "es-PE",
                            { day: "2-digit", month: "short", year: "numeric" },
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Orden de trabajo */}
                  <div className="rounded-md bg-muted/40 p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Orden de trabajo {note.work_order.correlative}
                      </span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700 border border-green-300">
                        {note.work_order.status.description}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">
                          Subtotal
                        </span>
                        <span className="font-medium">
                          S/{" "}
                          {Number(note.work_order.subtotal).toLocaleString(
                            "es-PE",
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">
                          IGV
                        </span>
                        <span className="font-medium">
                          S/{" "}
                          {Number(note.work_order.tax_amount).toLocaleString(
                            "es-PE",
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">
                          Total
                        </span>
                        <span className="font-bold">
                          S/{" "}
                          {Number(note.work_order.final_amount).toLocaleString(
                            "es-PE",
                            { minimumFractionDigits: 2 },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </GeneralSheet>
    </>
  );
};

export default WorkOrdersSheet;
