import { useQuery } from "@tanstack/react-query";
import { getMarketingConstants } from "./marketingConstants.actions";

export const useMarketingConstants = () => {
  return useQuery({
    queryKey: ["marketing-constants"],
    queryFn: getMarketingConstants,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};
