import { DataTable } from "@/shared/components/DataTable";
import { TaxClassTypesColumns } from "./TaxClassTypesColumns";
import { TaxClassTypesResource } from "../lib/taxClassTypes.interface";

interface Props {
  columns: TaxClassTypesColumns[];
  data: TaxClassTypesResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TaxClassTypesTable({
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
          dyn_code: true,
          description: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
