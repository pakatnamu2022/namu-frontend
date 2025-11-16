import { DataTable } from "@/shared/components/DataTable";
import { VoucherTypesColumns } from "./VoucherTypesColumns";
import { VoucherTypesResource } from "../lib/voucherTypes.interface";

interface Props {
  columns: VoucherTypesColumns[];
  data: VoucherTypesResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VoucherTypesTable({
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
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
