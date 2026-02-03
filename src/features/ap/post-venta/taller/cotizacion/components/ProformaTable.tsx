import { DataTable } from "@/shared/components/DataTable";
import { OrderQuotationColumns } from "./ProformaColumns";
import { OrderQuotationResource } from "../lib/proforma.interface";

interface Props {
  columns: OrderQuotationColumns[];
  data: OrderQuotationResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function OrderQuotationTable({
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
          quotation_number: true,
          quotation_date: true,
          expiration_date: false,
          total_amount: true,
          observations: false,
          is_take: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
