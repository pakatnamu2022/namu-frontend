import { DataTable } from "@/shared/components/DataTable";
import { VehiculoColumns } from "./VehiculoColumns";
import { VehiculoResource } from "../libs/vehiculo.interface";

interface Props {
    columns: VehiculoColumns[];
    data: VehiculoResource[];
    children?: React.ReactNode;
    isLoading?: boolean;
}

export default function VehiculoTable({
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
            >
                {children}
            </DataTable>
        </div>
    );
}