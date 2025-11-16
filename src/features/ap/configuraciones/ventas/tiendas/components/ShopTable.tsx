import { DataTable } from "@/src/shared/components/DataTable";
import { ShopColumns } from "./ShopColumns";
import { ShopResource } from "../lib/shop.interface";

interface Props {
  columns: ShopColumns[];
  data: ShopResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ShopTable({
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
