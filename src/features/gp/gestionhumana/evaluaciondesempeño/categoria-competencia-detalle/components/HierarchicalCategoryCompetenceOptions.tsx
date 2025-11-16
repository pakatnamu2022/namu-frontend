"use client";

import SearchInput from "@/shared/components/SearchInput";
import {
    CATEGORY_OBJECTIVE
} from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-objetivo-detalle/lib/hierarchicalCategoryObjective.constants";

export default function HierarchicalCategoryCompetenceOptions({
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
