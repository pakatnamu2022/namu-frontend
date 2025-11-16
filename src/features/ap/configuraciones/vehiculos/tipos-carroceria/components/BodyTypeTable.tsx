import { DataTable } from "@/src/shared/components/DataTable";
import { BodyTypeResource } from "../lib/bodyType.interface";
import { BodyTypeColumns } from "./BodyTypeColumns";

interface Props {
  columns: BodyTypeColumns[];
  data: BodyTypeResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function BodyTypeTable({
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
