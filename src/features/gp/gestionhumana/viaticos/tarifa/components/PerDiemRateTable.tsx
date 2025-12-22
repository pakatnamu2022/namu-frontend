import { DataTable } from "@/shared/components/DataTable";
import { PerDiemRateResource } from "../lib/perDiemRate.interface";
import { PerDiemRateColumns } from "./PerDiemRateColumns";

interface Props {
  columns: PerDiemRateColumns[];
  data: PerDiemRateResource[];
  children?: React.ReactNode;
  isLoading?: boolean;
}

export default function PerDiemRateTable({
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
          version: true,
          power: false,
          model_year: true,
          wheelbase: false,
          axles_number: false,
          width: false,
          length: false,
          transmission_id: false,
          transmission: false,
          currency_type_id: false,
          currency_type: false,
          status: true,
        }}
      >
        {children}
      </DataTable>
    </div>
  );
}
