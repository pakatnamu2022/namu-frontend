import {DataTable} from "@/src/shared/components/DataTable";
import {PeriodColumns} from "./PeriodColumns";
import {PeriodResource} from "../lib/period.interface";

interface Props {
    columns: PeriodColumns[];
    data: PeriodResource[];
    children?: React.ReactNode;
    isLoading?: boolean;
}

export default function PeriodTable({
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
