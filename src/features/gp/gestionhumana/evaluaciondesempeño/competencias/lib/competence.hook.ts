import {useQuery} from "@tanstack/react-query";
import {CompetenceResource, CompetenceResponse} from "./competence.interface";
import {getAllCompetence, getCompetence} from "./competence.actions";

export const useCompetences = (params?: Record<string, any>) => {
    return useQuery<CompetenceResponse>({
        queryKey: ["competence", params],
        queryFn: () => getCompetence({params}),
        refetchOnWindowFocus: false,
    });
};

export const useAllCompetences = () => {
    return useQuery<CompetenceResource[]>({
        queryKey: ["competenceAll"],
        queryFn: () => getAllCompetence(),
        refetchOnWindowFocus: false,
    });
};
