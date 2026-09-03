import { DataTable } from "@/shared/components/DataTable";
import type { AssetsColumn } from "./AssetsColumns";
import type { AssetResource } from "../lib/assets.interface";

interface Props {
  columns: AssetsColumn[];
  data: AssetResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function AssetsTable({
  columns,
  data,
  children,
  isLoading,
}: Props) {
  return (
    <div className="border-none text-muted-foreground max-w-full">
      <DataTable columns={columns} data={data} isLoading={isLoading}>
        {children}
      </DataTable>
    </div>
  );
}
