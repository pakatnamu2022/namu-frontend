import { DataTable } from "@/shared/components/DataTable";
import { EstablishmentsColumns } from "./EstablishmentsColumns";
import { EstablishmentsResource } from "../lib/establishments.interface";

interface Props {
  columns: EstablishmentsColumns[];
  data: EstablishmentsResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function EstablishmentsTable({
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
          type: true,
          activity_economic: true,
          full_address: true,
          ubigeo: false,
          location: true,
          sede: false,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
