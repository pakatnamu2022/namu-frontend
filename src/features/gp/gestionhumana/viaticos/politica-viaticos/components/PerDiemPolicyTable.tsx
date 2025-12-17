import { DataTable } from "@/shared/components/DataTable";
import { PerDiemPolicyResource } from "../lib/perDiemPolicy.interface";
import { PerDiemPolicyColumns } from "./PerDiemPolicyColumns";

interface Props {
  columns: PerDiemPolicyColumns[];
  data: PerDiemPolicyResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PerDiemPolicyTable({
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
          version: true,
          name: true,
          effective_from: true,
          effective_to: true,
          is_current: true,
          document_path: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
