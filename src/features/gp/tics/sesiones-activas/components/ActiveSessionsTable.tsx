import { DataTable } from "@/shared/components/DataTable";
import { ActiveSessionsColumns } from "./ActiveSessionsColumns";
import { ActiveSessionUser } from "../lib/activeSessions.interface";

interface Props {
  columns: ActiveSessionsColumns[];
  data: ActiveSessionUser[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ActiveSessionsTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
