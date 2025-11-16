import {DataTable} from "@/shared/components/DataTable";
import {HierarchicalCategoryCompetenceColumns} from "./HierarchicalCategoryCompetenceColumns";
import {
    HierarchicalCategoryCompetenceResource
} from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.interface";

interface Props {
    columns: HierarchicalCategoryCompetenceColumns[];
    data: HierarchicalCategoryCompetenceResource[];
    children?: React.ReactNode;
    isLoading?: boolean;
}

export default function HierarchicalCategoryCompetenceTable({
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
