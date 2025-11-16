import { DataTable } from "@/src/shared/components/DataTable";
import { EngineTypesResource } from "../lib/engineTypes.interface";
import { EngineTypesColumns } from "./EngineTypesColumns";

interface Props {
  columns: EngineTypesColumns[];
  data: EngineTypesResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function EngineTypesTable({
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
