import { DataTable } from "@/shared/components/DataTable";
import type { ExhibitionVehiclesColumns } from "./ExhibitionVehiclesColumns";
import type { ExhibitionVehiclesResource } from "../lib/exhibitionVehicles.interface";

interface ExhibitionVehiclesTableProps {
  columns: ExhibitionVehiclesColumns[];
  data: ExhibitionVehiclesResource[];
  isLoading?: boolean;
  children?: React.ReactNode;
}

export default function ExhibitionVehiclesTable({
  columns,
  data,
  isLoading = false,
  children,
}: ExhibitionVehiclesTableProps) {
  return (
    <DataTable
      columns={columns}
      data={data}
      isLoading={isLoading}
    >
      {children}
    </DataTable>
  );
}
