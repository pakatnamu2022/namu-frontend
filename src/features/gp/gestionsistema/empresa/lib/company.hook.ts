import { useQuery } from "@tanstack/react-query";
import { CompanyResource, CompanyResponse } from "./company.interface";
import { getAllCompanies, getCompany } from "./company.actions";

export const useCompanys = (params?: Record<string, any>) => {
  return useQuery<CompanyResponse>({
    queryKey: ["company", params],
    queryFn: () => getCompany({ params }),
    refetchOnWindowFocus: false,
  });
};

export const useAllCompanies = () => {
  return useQuery<CompanyResource[]>({
    queryKey: ["companyAll"],
    queryFn: () => getAllCompanies(),
    refetchOnWindowFocus: false,
  });
};
