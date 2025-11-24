import { DataTable } from "@/shared/components/DataTable";
import { AdjustmentsProductListItem } from "../lib/adjustmentsProduct.interface";
import { AdjustmentsProductColumns } from "./AdjustmentsProductColumns";

interface Props {
  columns: AdjustmentsProductColumns[];
  data: AdjustmentsProductListItem[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AdjustmentsProductTable({
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
          full_name: true,
          num_doc: true,
          document_type: false,
          phone: true,
          email: false,
          type_person: true,
          person_segment: true,
          district: false,
          nationality: false,
          legal_representative_full_name: false,
          driving_license: false,
          status_license: false,
          restriction: false,
          company_status: false,
          company_condition: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
