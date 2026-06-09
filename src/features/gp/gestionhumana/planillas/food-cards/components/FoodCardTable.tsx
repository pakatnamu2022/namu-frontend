import { DataTable } from "@/shared/components/DataTable";
import { FoodCardColumns } from "./FoodCardColumns";
import { FoodCardResource } from "../lib/food-card.interface";

interface Props {
  columns: FoodCardColumns[];
  data: FoodCardResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function FoodCardTable({
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
