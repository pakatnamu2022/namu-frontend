import { DataTable } from "@/shared/components/DataTable";
import { CurrencyTypesResource } from "../lib/CurrencyTypes.interface";
import { CurrencyTypesColumns } from "./CurrencyTypesColumns";

interface Props {
  columns: CurrencyTypesColumns[];
  data: CurrencyTypesResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function CurrencyTypesTable({
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
          name: true,
          symbol: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
