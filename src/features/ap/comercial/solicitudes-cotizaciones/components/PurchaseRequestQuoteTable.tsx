import { DataTable } from "@/shared/components/DataTable";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";
import { PurchaseRequestQuoteColumns } from "./PurchaseRequestQuoteColumns";
import { SortingState, Updater } from "@tanstack/react-table";

interface Props {
  columns: PurchaseRequestQuoteColumns[];
  data: PurchaseRequestQuoteResource[];
  children?: React.ReactNode;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  isLoading?: boolean;
}

export default function PurchaseRequestQuoteTable({
  columns,
  data,
  children,
  sorting,
  onSortingChange,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        sorting={sorting}
        onSortingChange={(updater: Updater<SortingState>) => {
          onSortingChange(
            typeof updater === "function" ? updater(sorting) : updater,
          );
        }}
        initialColumnVisibility={{
          doc_type_currency: false,
          correlative: true,
          type_document: true,
          doc_sale_price: true,
          sale_price: false,
          comment: false,
          holder: true,
          client_name: false,
          exchange_rate: false,
          type_currency: false,
          base_selling_price: false,
          warranty: false,
          sede: false,
          ap_vehicle: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
