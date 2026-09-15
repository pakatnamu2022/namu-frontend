import { useQuery } from "@tanstack/react-query";
import { ApplicantDataChangeResponse } from "./applicantDataChange.interface.ts";
import { getApplicantDataChanges } from "./applicantDataChange.actions.ts";
import { APPLICANT_DATA_CHANGE } from "./applicantDataChange.constant.ts";

const { QUERY_KEY } = APPLICANT_DATA_CHANGE;

export const useApplicantDataChanges = (params?: Record<string, any>) => {
  return useQuery<ApplicantDataChangeResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getApplicantDataChanges({ params }),
    refetchOnWindowFocus: false,
  });
};
