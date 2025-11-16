import { DataTable } from "@/shared/components/DataTable";
import { SuppliersColumns } from "./SuppliersColumns";
import { SuppliersResource } from "../lib/suppliers.interface";

interface Props {
  columns: SuppliersColumns[];
  data: SuppliersResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function SuppliersTable({
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
          email: true,
          phone: false,
          type_person: true,
          person_segment: true,
          district: false,
          nationality: false,
          direction: false,
          origin: false,
          tax_class_type: false,
          marital_status: false,
          gender: false,
          activity_economic: false,
          legal_representative_full_name: false,
          driving_license: false,
          status_license: false,
          supplier_tax_class_type: false,
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
