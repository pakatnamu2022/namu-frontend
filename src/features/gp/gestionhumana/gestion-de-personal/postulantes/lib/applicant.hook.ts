import { useQuery } from "@tanstack/react-query";
import { ApplicantResponse } from "./applicant.interface.ts";
import { getApplicants } from "./applicant.actions.ts";
import { APPLICANT } from "./applicant.constant.ts";

const { QUERY_KEY } = APPLICANT;

export const useApplicants = (params?: Record<string, any>) => {
  return useQuery<ApplicantResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getApplicants({ params }),
    refetchOnWindowFocus: false,
  });
};
