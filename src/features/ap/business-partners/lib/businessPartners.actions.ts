import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api.ts";
import {
  getBusinessPartnersProps,
  BusinessPartnersResource,
  BusinessPartnersResponse,
} from "./businessPartners.interface.ts";
import { BUSINESS_PARTNERS_MASTER } from "./businessPartners.constants.ts";

const { ENDPOINT } = BUSINESS_PARTNERS_MASTER;

export async function getBusinessPartners({
  params,
}: getBusinessPartnersProps): Promise<BusinessPartnersResponse> {
  const config: AxiosRequestConfig = {
    params,
  };
  const { data } = await api.get<BusinessPartnersResponse>(ENDPOINT, config);
  return data;
}

export async function findBusinessPartnersById(
  id: number,
): Promise<BusinessPartnersResource> {
  const response = await api.get<BusinessPartnersResource>(
    `${ENDPOINT}/${id}`,
  );
  return response.data;
}
