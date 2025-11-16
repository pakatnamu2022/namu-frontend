import { DataTable } from "@/src/shared/components/DataTable";
import { ApprovedAccesoriesColumns } from "./ApprovedAccessoriesColumns";
import { ApprovedAccesoriesResource } from "../lib/approvedAccessories.interface";

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
          type: true,
          description: true,
          price: true,
          type_currency: true,
          body_type: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
