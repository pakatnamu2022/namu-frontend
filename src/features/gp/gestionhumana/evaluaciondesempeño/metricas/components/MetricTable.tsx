import {DataTable} from "@/shared/components/DataTable";
import {MetricColumns} from "./MetricColumns";
import {MetricResource} from "../lib/metric.interface";

interface Props {
    columns: MetricColumns[];
    data: MetricResource[];
    children?: React.ReactNode;
    isLoading?: boolean;
}

export default function MetricTable({
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
                    estado_uso: false,
                    status: false,
                }}
            >
                {children}
            </DataTable>
        </div>
    );
}
