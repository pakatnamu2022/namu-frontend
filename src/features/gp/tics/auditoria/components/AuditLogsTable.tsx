import { DataTable } from "@/shared/components/DataTable";
import { AuditLogsColumns } from "./AuditLogsColumns";
import { AuditLogsResource } from "../lib/auditLogs.interface";

interface Props {
  columns: AuditLogsColumns[];
  data: AuditLogsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AuditLogsTable({
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
          vin: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
