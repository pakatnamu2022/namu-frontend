import { DataTable } from "@/shared/components/DataTable";
import { ViewColumns } from "./ViewColumns";
import { ViewResource } from "../lib/view.interface";

interface Props {
  columns: ViewColumns[];
  data: ViewResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function ViewTable({
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
          id: false,
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
