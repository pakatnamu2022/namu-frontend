"use client";

import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";
import { DataTable } from "@/shared/components/DataTable";
import {
  ElectronicDocumentItem,
  ElectronicDocumentResource,
} from "../lib/electronicDocument.interface";
import { debitNoteItemsColumns } from "./DebitNoteItemsColumns";

interface DebitNoteItemsTableProps {
  items: ElectronicDocumentItem[];
  originalDocument: ElectronicDocumentResource;
}

export function DebitNoteItemsTable({
  items,
  originalDocument,
}: DebitNoteItemsTableProps) {
  const currency =
    originalDocument.currency?.iso_code === "PEN"
      ? "S/ "
      : originalDocument.currency?.iso_code === "USD"
      ? "$ "
      : `${originalDocument.currency?.iso_code} `;
  // Identify advance payment regularization items
  const advanceItems = items.filter((item) => item.anticipo_regularizacion);

  // Calculate totals - items come with their values as stored in the DB
  // Advance regularizations already have negative values in the original document
  const totalSubtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalIgv = items.reduce((sum, item) => sum + item.igv, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Items del Documento Original</h4>
        <Badge variant="outline">{items.length} item(s)</Badge>
      </div>

      {/* Info message if advance items are present */}
      {advanceItems.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-purple-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-800">
              Regularización de anticipo incluida
            </p>
            <p className="text-sm text-purple-700">
              Este documento incluye {advanceItems.length} item(s) de
              regularización de anticipo. Estos items se restarán del total de
              la nota de débito (valores negativos).
            </p>
          </div>
        </div>
      )}

      {/* Table with max height to prevent overflow */}
      <div className="max-h-[400px] overflow-auto rounded-lg">
        <DataTable
          columns={debitNoteItemsColumns({ currency })}
          data={items}
          isVisibleColumnFilter={false}
        />
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg border">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Subtotal</p>
          <p className="text-lg font-semibold">
            {currency}
            {totalSubtotal.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">IGV (18%)</p>
          <p className="text-lg font-semibold">
            {currency}
            {totalIgv.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold text-primary">
            {currency}
            {totalAmount.toLocaleString("es-PE", {
              minimumFractionDigits: 2,
            })}
          </p>
        </div>
      </div>
    </div>
  );
}
