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
          full_name_client: true,
          plate: true,
          email_client: false,
          phone_client: false,
          date_appointment: true,
          time_appointment: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
