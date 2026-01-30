import type { AxiosRequestConfig } from "axios";
import { api } from "@/core/api";
import { GeneralResponse } from "@/shared/lib/response.interface";
import {
  getCustomersProps,
  CustomersResource,
  CustomersResponse,
  CustomersRequest,
} from "./customers.interface";
import { CUSTOMERS } from "./customers.constants";
import { TYPE_BUSINESS_PARTNERS } from "@/core/core.constants";
import { OpportunityResource } from "../../oportunidades/lib/opportunities.interface";

const { ENDPOINT } = CUSTOMERS;

export async function getCustomers({
  params,
}: getCustomersProps): Promise<CustomersResponse> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      type: [TYPE_BUSINESS_PARTNERS.CLIENTE, TYPE_BUSINESS_PARTNERS.AMBOS],
    },
  };
  const { data } = await api.get<CustomersResponse>(ENDPOINT, config);
  return data;
}

export async function getAllCustomers({
  params,
}: getCustomersProps): Promise<CustomersResource[]> {
  const config: AxiosRequestConfig = {
    params: {
      ...params,
      all: true,
      type: [TYPE_BUSINESS_PARTNERS.CLIENTE, TYPE_BUSINESS_PARTNERS.AMBOS],
    },
  };
  const { data } = await api.get<CustomersResource[]>(ENDPOINT, config);
  return data;
}

export async function getCustomersById(id: number): Promise<CustomersResource> {
  const { data } = await api.get<CustomersResource>(`${ENDPOINT}/${id}`);
  return data;
}

export async function findCustomersById(
  id: number,
): Promise<CustomersResource> {
  const response = await api.get<CustomersResource>(`${ENDPOINT}/${id}`);
  return response.data;
}

export async function findCustomerValidated(
  id: number,
  lead_id: number,
): Promise<CustomersResource> {
  const config: AxiosRequestConfig = {
    params: {
      lead_id,
    },
  };
  const response = await api.get<CustomersResource>(
    `${ENDPOINT}/${id}/validateOpportunity`,
    config,
  );
  return response.data;
}

export async function storeCustomers(
  payload: CustomersRequest,
): Promise<CustomersResource> {
  const { data } = await api.post<CustomersResource>(ENDPOINT, payload);
  return data;
}

export async function updateCustomers(
  id: number,
  payload: CustomersRequest,
): Promise<CustomersResource> {
  const { data } = await api.put<CustomersResource>(
    `${ENDPOINT}/${id}`,
    payload,
  );
  return data;
}

export async function deleteCustomers(
  id: number,
  type?: string,
): Promise<GeneralResponse> {
  const payload = { type: type || TYPE_BUSINESS_PARTNERS.CLIENTE };
  const { data } = await api.patch<GeneralResponse>(
    `${ENDPOINT}/${id}/remove-type`,
    payload,
  );
  return data;
}

export async function getAllOpportunitiesByCustomer(
  id: number,
): Promise<OpportunityResource[]> {
  const { data } = await api.get<OpportunityResource[]>(
    `${ENDPOINT}/${id}/opportunities`,
  );
  return data;
}
