import { DataTable } from "@/shared/components/DataTable";
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
          status_num_doc: true,
          sede: true,
          vehicle_brand: true,
          worker: true,
          district: true,
          model: false,
          version: false,
          document_type: false,
          num_doc: true,
          full_name: true,
          phone: true,
          email: true,
          use: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
