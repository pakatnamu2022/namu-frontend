import { useQuery } from "@tanstack/react-query";

import { TYPE_ONBOARDING } from "./typeOnboarding.constants";
import {
  TypeOnboardingResource,
  TypeOnboardingResponse,
} from "./typeOnboarding.interface";
import {
  findTypeOnboardingById,
  getAllTypeOnboarding,
  getTypeOnboarding,
} from "./typeOnboarding.actions";

const { QUERY_KEY } = TYPE_ONBOARDING;

export const useTypeOnboarding = (params?: Record<string, any>) => {
  return useQuery<TypeOnboardingResponse>({
    queryKey: [QUERY_KEY, params],
    queryFn: () => getTypeOnboarding({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllTypeOnboarding = () => {
  return useQuery<TypeOnboardingResource[]>({
    queryKey: ["typeOnboarding", "all"],
    queryFn: () => getAllTypeOnboarding(),
    refetchOnWindowFocus: false,
  });
};

export const useTypeOnboardingById = (id: number) => {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => findTypeOnboardingById(id),
    refetchOnWindowFocus: false,
  });
};
