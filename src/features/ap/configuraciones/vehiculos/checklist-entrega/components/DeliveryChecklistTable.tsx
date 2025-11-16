import { DataTable } from "@/src/shared/components/DataTable";
import { DeliveryChecklistColumns } from "./DeliveryChecklistColumns";
import { DeliveryChecklistResource } from "../lib/deliveryChecklist.interface";

interface Props {
  columns: DeliveryChecklistColumns[];
  data: DeliveryChecklistResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function DeliveryChecklistTable({
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
          description: true,
          category: true,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
