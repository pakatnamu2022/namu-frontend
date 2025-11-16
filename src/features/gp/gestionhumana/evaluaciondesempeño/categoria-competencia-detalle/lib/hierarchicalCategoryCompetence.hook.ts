import {useQuery} from "@tanstack/react-query";
import {
    CategoryCompetencePersonResponse,
    HierarchicalCategoryCompetenceResource,
    HierarchicalCategoryCompetenceResponse,
} from "./hierarchicalCategoryCompetence.interface";
import {
    CATEGORY_COMPETENCE
} from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.constants";
import {
    findHierarchicalCategoryCompetenceById, getCategoryCompetencePersonById,
    getHierarchicalCategoryCompetence
} from "@/features/gp/gestionhumana/evaluaciondesempeño/categoria-competencia-detalle/lib/hierarchicalCategoryCompetence.actions";

const {QUERY_KEY} = CATEGORY_COMPETENCE;

export const useHierarchicalCategoryCompetences = (
    params?: Record<string, any>
) => {
    return useQuery<HierarchicalCategoryCompetenceResponse>({
        queryKey: [QUERY_KEY, params],
        queryFn: () => getHierarchicalCategoryCompetence({params}),
        refetchOnWindowFocus: false,
    });
};

export const useHierarchicalCategoryCompetenceById = (id: number) => {
    return useQuery<HierarchicalCategoryCompetenceResource>({
        queryKey: [QUERY_KEY, id],
        queryFn: () => findHierarchicalCategoryCompetenceById(id),
        refetchOnWindowFocus: false,
    });
};

export const useCategoryCompetenceWorkerById = (id: number) => {
    return useQuery<CategoryCompetencePersonResponse[]>({
        queryKey: [QUERY_KEY + "Person", id],
        queryFn: () => getCategoryCompetencePersonById(id),
        refetchOnWindowFocus: false,
    });
};
