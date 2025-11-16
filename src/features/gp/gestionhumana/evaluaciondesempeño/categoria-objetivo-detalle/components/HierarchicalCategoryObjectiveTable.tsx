import {DataTable} from "@/src/shared/components/DataTable";
import {HierarchicalCategoryObjectiveColumns} from "./HierarchicalCategoryObjectiveColumns";
import {
    HierarchicalCategoryObjectiveResource
} from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.interface";

interface Props {
    columns: HierarchicalCategoryObjectiveColumns[];
    data: HierarchicalCategoryObjectiveResource[];
    children?: React.ReactNode;
    isLoading?: boolean;
}

export default function HierarchicalCategoryObjectiveTable({
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
                    description: false,
                }}
            >
                {children}
            </DataTable>
        </div>
    );
}
