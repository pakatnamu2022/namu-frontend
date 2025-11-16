"use client";

import {ColumnDef} from "@tanstack/react-table";
import {DeleteButton} from "@/shared/components/SimpleDeleteDialog";
import {
    HierarchicalCategoryCompetenceResource
} from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.interface";

export type HierarchicalCategoryCompetenceColumns =
    ColumnDef<HierarchicalCategoryCompetenceResource>;

export const hierarchicalCategoryCompetenceColumns = ({
                                                          onDeleteAction,
                                                      }: {
    onDeleteAction: (id: number) => void;
    onUpdateGoal: (id: number, value: number) => void;
    onUpdateWeight: (id: number, value: number) => void;
}): HierarchicalCategoryCompetenceColumns[] => [
    {
        accessorKey: "competence",
        header: "Objetivo",
        cell: ({getValue}) => (
            <span className="font-semibold">{getValue() as string}</span>
        ),
    },
    {
        id: "actions",
        header: "Acciones",
        cell: ({row}) => {
            const id = row.original.id;

            return (
                <div className="flex items-center gap-2">
                    {/* Delete */}
                    <DeleteButton onClick={() => onDeleteAction(id)}/>
                </div>
            );
        },
    },
];
