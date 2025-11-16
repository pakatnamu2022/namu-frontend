import { DataTable } from "@/src/shared/components/DataTable";
import { ManageLeadsColumns } from "./ManageLeadsColumns";
import { ManageLeadsResource } from "../lib/manageLeads.interface";

interface Props {
  columns: ManageLeadsColumns[];
  data: ManageLeadsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleCategoryTable({
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
          created_at: true,
          registration_date: true,
          sede: true,
          full_name: true,
          phone: true,
          email: true,
          vehicle_brand: true,
          document_type: false,
          num_doc: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
