import { DataTable } from "@/shared/components/DataTable.tsx";
import { PurchaseHistoryItem } from "../lib/inventoryMovements.interface.ts";
import { PurchaseHistoryColumns } from "./PurchaseHistoryColumns.tsx";

interface Props {
  columns: PurchaseHistoryColumns[];
  data: PurchaseHistoryItem[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PurchaseHistoryTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
