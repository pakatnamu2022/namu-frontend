import { useQuery } from "@tanstack/react-query";
import {
  TelephoneAccountResource,
  TelephoneAccountResponse,
} from "./telephoneAccount.interface";
import {
  getAllTelephoneAccounts,
  getTelephoneAccounts,
  getTelephoneOperators,
} from "./telephoneAccount.actions";

export const useTelephoneAccounts = (params?: Record<string, any>) => {
  return useQuery<TelephoneAccountResponse>({
    queryKey: ["telephoneAccount", params],
    queryFn: () => getTelephoneAccounts({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTelephoneAccounts = () => {
  return useQuery<TelephoneAccountResource[]>({
    queryKey: ["telephoneAccountAll"],
    queryFn: () => getAllTelephoneAccounts(),
    refetchOnWindowFocus: false,
  });
};

export const useTelephoneOperators = () => {
  return useQuery<string[]>({
    queryKey: ["telephoneOperators"],
    queryFn: () => getTelephoneOperators(),
    refetchOnWindowFocus: false,
  });
};
