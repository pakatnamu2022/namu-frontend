import { DataTable } from "@/shared/components/DataTable";
import { BonusColumns } from "./BonusColumns";
import { BonusResource } from "../lib/bonus.interface";

interface Props {
  columns: BonusColumns[];
  data: BonusResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function BonusTable({
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
        initialColumnVisibility={{}}
      >
        {children}
      </DataTable>
    </div>
  );
}
