import { DataTable } from "@/shared/components/DataTable";
import { TipoVehiculoColumns } from "./TipoVehiculoColumns";
import { TipoVehiculoResource } from "../libs/tipoVehiculo.interface";

interface Props {
    columns: TipoVehiculoColumns[];
    data: TipoVehiculoResource[];
    children?: React.ReactNode;
    isLoading?: boolean;
}

export default function TipoVehiculoTable({
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