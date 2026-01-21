import { DataTable } from "@/shared/components/DataTable";
import { AccountantDistrictAssignmentResource } from "../lib/accountantDistrictAssignment.interface";
import { AccountantDistrictAssignmentColumns } from "./AccountantDistrictAssignmentColumns";

interface Props {
  columns: AccountantDistrictAssignmentColumns[];
  data: AccountantDistrictAssignmentResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AccountantDistrictAssignmentTable({
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
          "worker.name": true,
          "worker.document": true,
          "worker.position": true,
          "district.name": true,
          "district.province": true,
          "district.department": true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
