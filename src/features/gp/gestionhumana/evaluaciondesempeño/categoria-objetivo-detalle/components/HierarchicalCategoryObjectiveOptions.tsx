"use client";

import SearchInput from "@/src/shared/components/SearchInput";
import {
    CATEGORY_OBJECTIVE
} from "@/src/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.constants";

export default function HierarchicalCategoryObjectiveOptions({
                                                                 search,
                                                                 setSearchAction,
                                                             }: {
    search: string;
    setSearchAction: (value: string) => void;
}) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            <SearchInput
                value={search}
                onChange={setSearchAction}
                placeholder={`Buscar ${CATEGORY_OBJECTIVE.MODEL.name}...`}
            />
        </div>
    );
}
