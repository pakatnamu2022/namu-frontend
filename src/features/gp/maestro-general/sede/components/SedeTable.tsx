import { DataTable } from "@/shared/components/DataTable";
import { SedeColumns } from "./SedeColumns";
import { SedeResource } from "../lib/sede.interface";

interface Props {
  columns: SedeColumns[];
  data: SedeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function SedeTable({
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
          abreviatura: true,
          dyn_code: true,
          establishment: false,
          direccion: true,
          company: true,
          district: false,
          province: false,
          department: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
