import { useQuery } from "@tanstack/react-query";
import { CompanyResource, CompanyResponse } from "./company.interface.ts";
import {
  getAllCompanies,
  getCompany,
  findCompanyById,
} from "./company.actions.ts";

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

export const useCompanyById = (id: number) => {
  return useQuery<CompanyResource>({
    queryKey: ["company", id],
    queryFn: () => findCompanyById(id),
    refetchOnWindowFocus: false,
  });
};
