import { useQuery } from "@tanstack/react-query";
import { SignerResource, SignerResponse } from "./signer.interface.ts";
import { getAllSigners, getSigners } from "./signer.actions.ts";
import { SIGNER } from "./signer.constant.ts";

const { QUERY_KEY } = SIGNER;

export const useSigners = (params?: Record<string, any>) => {
  return useQuery<SignerResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getSigners({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllSigners = (params?: Record<string, any>) => {
  return useQuery<SignerResource[]>({
    queryKey: [QUERY_KEY + "All", params],
    queryFn: () => getAllSigners({ params }),
    refetchOnWindowFocus: false,
  });
};
