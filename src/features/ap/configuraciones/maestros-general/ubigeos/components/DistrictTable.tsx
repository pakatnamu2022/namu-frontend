import { DataTable } from "@/shared/components/DataTable";
import { DistrictColumns } from "./DistrictColumns";
import { DistrictResource } from "../lib/district.interface";

interface Props {
  columns: DistrictColumns[];
  data: DistrictResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function DistrictTable({
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
          ubigeo: true,
          name: true,
          province: true,
          department: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
