import { useQuery } from "@tanstack/react-query";
import { FreightControlResponse } from "./freightControl.interface";
import { CustomerSearchParams, CustomerSearchResponse, findFreightById, FormDataResponse, getFormData, getFreight, searchCustomers } from "./freightControl.actions";

export const useFreightsControl = (params?: Record<string, any>) => {
    return useQuery<FreightControlResponse>({
        queryKey: ["freight", params],
        queryFn: () => getFreight({ params }),
        refetchOnWindowFocus: false,
    });
};

export const useFreightById = (id: number) => {
    return useQuery({
        queryKey: ["freight", id],
        queryFn: () => findFreightById(id),
        refetchOnWindowFocus: false,
    });
};

export const useFormData = () => {
    return useQuery<FormDataResponse>({
        queryKey: ["freight-form-data"],
        queryFn: getFormData,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    })
};

export const useCustomerSearch = (params?: CustomerSearchParams) => {
    return useQuery<CustomerSearchResponse>({
        queryKey: ["customer-search", params],
        queryFn: () => searchCustomers(params || {}),
        refetchOnWindowFocus: false,
        staleTime: 2 * 60 * 1000,
        enabled: !!params && !!params.search,
    });
};
