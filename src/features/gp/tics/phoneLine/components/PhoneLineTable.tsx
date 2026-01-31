import { DataTable } from "@/shared/components/DataTable";
import { PhoneLineColumns } from "./PhoneLineColumns";
import { PhoneLineResource } from "../lib/phoneLine.interface";

interface Props {
  columns: PhoneLineColumns[];
  data: PhoneLineResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PhoneLineTable({
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
          active_assignment_assigned_at: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
