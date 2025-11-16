import { DataTable } from "@/src/shared/components/DataTable";
import { EconomicActivityColumns } from "./EconomicActivityColumns";
import { EconomicActivityResource } from "../lib/economicActivity.interface";

interface Props {
  columns: EconomicActivityColumns[];
  data: EconomicActivityResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function EconomicActivityTable({
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
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
