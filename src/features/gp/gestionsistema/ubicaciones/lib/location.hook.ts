import { useQuery } from "@tanstack/react-query";
import {
  getAllDepartment,
  getAllDistrict,
  getAllProvince,
} from "./location.actions";
import {
  DepartmentResource,
  DistrictResource,
  ProvinceResource,
} from "./location.interface";

export const useAllDepartment = (params?: Record<string, any>) => {
  return useQuery<DepartmentResource[]>({
    queryKey: ["departmentAll", params],
    queryFn: () => getAllDepartment(params),
    refetchOnWindowFocus: false,
  });
};

export const useAllProvince = (params?: Record<string, any>) => {
  return useQuery<ProvinceResource[]>({
    queryKey: ["provinceAll", params],
    queryFn: () => getAllProvince(params),
    refetchOnWindowFocus: false,
  });
};

export const useAllDistrict = (params?: Record<string, any>) => {
  return useQuery<DistrictResource[]>({
    queryKey: ["districtAll", params],
    queryFn: () => getAllDistrict(params),
    refetchOnWindowFocus: false,
  });
};
