import { DataTable } from "@/shared/components/DataTable.tsx";
import { ApprovedAccesoriesColumns } from "./ApprovedAccessoriesColumns.tsx";
import { ApprovedAccesoriesResource } from "../lib/approvedAccessories.interface.ts";

interface Props {
  columns: ApprovedAccesoriesColumns[];
  data: ApprovedAccesoriesResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ApprovedAccesoriesTable({
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
          code: true,
          type_operation: true,
          description: true,
          prices: true,
          type_currency: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
