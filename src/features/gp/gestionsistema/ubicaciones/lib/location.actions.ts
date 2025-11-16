import { api } from "@/src/core/api";
import { AxiosRequestConfig } from "axios";
import {
  DepartmentResource,
  DistrictResource,
  ProvinceResource,
} from "./location.interface";

export async function getAllDepartment(
  params: Record<string, any> = {}
): Promise<DepartmentResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<DepartmentResource[]>(
    "/gp/gs/department",
    config
  );
  return data;
}

export async function getAllProvince(
  params: Record<string, any> = {}
): Promise<ProvinceResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<ProvinceResource[]>("/gp/gs/province", config);
  return data;
}

export async function getAllDistrict(
  params: Record<string, any> = {}
): Promise<DistrictResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      all: true,
      ...params,
    },
  };
  const { data } = await api.get<DistrictResource[]>("/gp/gs/district", config);
  return data;
}
