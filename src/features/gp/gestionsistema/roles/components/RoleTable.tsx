import { DataTable } from "@/src/shared/components/DataTable";
import { RoleColumns } from "./RoleColumns";
import { RoleResource } from "../lib/role.interface";

interface Props {
  columns: RoleColumns[];
  data: RoleResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function RoleTable({
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
          submodule: false,
          slug: false,
          ruta: false,
          padre: false,
          subPadre: false,
          hijo: false,
          icono: false,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
