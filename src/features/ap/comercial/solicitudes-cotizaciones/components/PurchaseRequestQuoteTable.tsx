import { DataTable } from "@/src/shared/components/DataTable";
import { PurchaseRequestQuoteResource } from "../lib/purchaseRequestQuote.interface";
import { PurchaseRequestQuoteColumns } from "./PurchaseRequestQuoteColumns";

interface Props {
  columns: PurchaseRequestQuoteColumns[];
  data: PurchaseRequestQuoteResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PurchaseRequestQuoteTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable
        columns={columns}
        data={data}
        isLoading={isLoading}
        initialColumnVisibility={{
          correlative: true,
          type_document: true,
          doc_sale_price: true,
          sale_price: false,
          doc_type_currency: true,
          comment: false,
          holder: true,
          client_name: false,
          exchange_rate: false,
          type_currency: false,
          base_selling_price: false,
          warranty: false,
          sede: false,
          ap_vehicle: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
