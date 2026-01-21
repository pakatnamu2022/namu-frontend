import { DataTable } from "@/shared/components/DataTable";
import { OrderQuotationMesonColumns } from "./ProformaMesonColumns";
import { OrderQuotationResource } from "../../../taller/cotizacion/lib/proforma.interface";

interface Props {
  columns: OrderQuotationMesonColumns[];
  data: OrderQuotationResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function OrderQuotationMesonTable({
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
          expiration_date: true,
          collection_date: false,
          plate: true,
          customer: true,
          total_amount: true,
          observations: false,
          discard_reason: false,
          date_appointment: true,
          discarded_note: false,
          discarded_by_name: false,
          discarded_at: false,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
