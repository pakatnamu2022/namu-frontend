import { DataTable } from "@/shared/components/DataTable";
import { CustomersColumns } from "./CustomersPvColumns";
import { CustomersResource } from "@/features/ap/comercial/clientes/lib/customers.interface";

interface Props {
  columns: CustomersColumns[];
  data: CustomersResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CustomersPvTable({
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
          direction: false,
          tax_class_type: false,
          company_status: false,
          company_condition: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
