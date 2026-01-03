import { DataTable } from "@/shared/components/DataTable";
import { TravelControlColumns } from "./TravelControlColumns";
import { TravelControlResource } from "@/features/tp/comercial/ControlViajes/lib/travelControl.interface";

interface Props {
  columns: TravelControlColumns[];
  data: TravelControlResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function TravelControlTable({
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
