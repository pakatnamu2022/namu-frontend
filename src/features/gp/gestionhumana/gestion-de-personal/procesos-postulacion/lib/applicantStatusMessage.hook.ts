import { useQuery } from "@tanstack/react-query";
import { ApplicantStatusMessageResource } from "./applicantStatusMessage.interface.ts";
import { getApplicantStatusMessages } from "./applicantStatusMessage.actions.ts";

export const useApplicantStatusMessages = () => {
  return useQuery<ApplicantStatusMessageResource[]>({
    queryKey: ["applicantStatusMessage"],
    queryFn: getApplicantStatusMessages,
    refetchOnWindowFocus: false,
  });
};
