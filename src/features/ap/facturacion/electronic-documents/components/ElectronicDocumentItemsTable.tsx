"use client";

import { DataTable } from "@/shared/components/DataTable";
import { ElectronicDocumentItemSchema } from "../lib/electronicDocument.schema";
import { getElectronicDocumentItemColumns } from "./ElectronicDocumentItemColumns";

interface ElectronicDocumentItemsTableProps {
  items: ElectronicDocumentItemSchema[];
  currencySymbol: string;
  onRemoveItem: (index: number) => void;
  onEditItem?: (index: number) => void;
  isAdvancePayment?: boolean;
  showActions?: boolean;
}

export function ElectronicDocumentItemsTable({
  items,
  currencySymbol,
  onRemoveItem,
  onEditItem,
  isAdvancePayment = false,
  showActions = true,
}: ElectronicDocumentItemsTableProps) {
  // Agregar índice a cada item para el manejo de eliminación
  const itemsWithIndex = items.map((item, index) => ({ ...item, index }));

  const columns = getElectronicDocumentItemColumns({
    currencySymbol,
    onRemove: onRemoveItem,
    onEdit: onEditItem,
    isAdvancePayment,
    showActions,
  });

  return (
    <DataTable
      columns={columns}
      data={itemsWithIndex}
      isVisibleColumnFilter={false}
    />
  );
}
