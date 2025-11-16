import { DataTable } from "@/src/shared/components/DataTable";
import { BrandGroupResource } from "../lib/brandGroup.interface";
import { BrandGroupColumns } from "./BrandGroupColumns";

interface Props {
  columns: BrandGroupColumns[];
  data: BrandGroupResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function BrandGroupTable({
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
