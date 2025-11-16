import { DataTable } from "@/src/shared/components/DataTable";
import { BrandsResource } from "../lib/brands.interface";
import { BrandColumns } from "./BrandsColumns";

interface Props {
  columns: BrandColumns[];
  data: BrandsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function VehicleCategoryTable({
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
          dyn_code: true,
          name: true,
          description: false,
          group: true,
          logo: true,
          logo_min: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
