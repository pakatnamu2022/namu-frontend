import { DataTable } from "@/src/shared/components/DataTable";
import { CommercialManagerBrandGroupResource } from "../lib/commercialManagerBrandGroup.interface";
import { CommercialManagerBrandGroupColumns } from "./CommercialManagerBrandGroupColumns";

interface Props {
  columns: CommercialManagerBrandGroupColumns[];
  data: CommercialManagerBrandGroupResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CommercialManagerBrandGroupTable({
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
          period: false,
          brand_group: true,
          commercial_managers: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
