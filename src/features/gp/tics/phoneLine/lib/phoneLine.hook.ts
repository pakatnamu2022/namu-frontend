import { useQuery } from "@tanstack/react-query";
import {
  PhoneLineResponse,
  PhoneLineWorkerResource,
} from "./phoneLine.interface";
import {
  getAllTelephoneAccounts,
  getAllTelephonePlans,
  getPhoneLines,
  getPhoneLineHistory,
} from "./phoneLine.actions";
import { PHONE_LINE } from "./phoneLine.constants";

const { QUERY_KEY } = PHONE_LINE;

export const usePhoneLines = (params?: Record<string, any>) => {
  return useQuery<PhoneLineResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getPhoneLines({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTelephoneAccounts = () => {
  return useQuery<any[]>({
    queryKey: ["telephoneAccountAll"],
    queryFn: () => getAllTelephoneAccounts(),
    refetchOnWindowFocus: false,
  });
};

export const useAllTelephonePlans = () => {
  return useQuery<any[]>({
    queryKey: ["telephonePlanAll"],
    queryFn: () => getAllTelephonePlans(),
    refetchOnWindowFocus: false,
  });
};

export const usePhoneLineHistory = (phoneLineId: number | null) => {
  return useQuery<PhoneLineWorkerResource[]>({
    queryKey: ["phoneLineHistory", phoneLineId],
    queryFn: () => getPhoneLineHistory(phoneLineId!),
    enabled: phoneLineId !== null,
    refetchOnWindowFocus: false,
  });
};
