import { api } from "@/core/api";
import { FREIGHTCONTROL } from "./freightControl.constants";
import { FreightControlResource, FreightControlResponse, getFreightControlProps } from "./freightControl.interface";
import { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface";


const { ENDPOINT } = FREIGHTCONTROL;

export interface FormDataResponse{
    customers: Array<{
        id: string;
        nombre_completo: string;
        vat: string;
    }>;
    cities: Array<{
        id: string;
        descripcion: string;
    }>;
}

export interface CustomerSearchResponse {
    success: boolean;
    data: Array<{
        id: string;
        nombre_completo: string;
        vat: string;
    }>;
    total: number;
}

export interface CustomerSearchParams {
    search?: string;
    limit?: number;
}

export async function getFormData(): Promise<FormDataResponse>{
    const { data } = await api.get<FormDataResponse>(`${ENDPOINT}/form/data`);
    return data;
}

export async function searchCustomers(params?: CustomerSearchParams): Promise<CustomerSearchResponse> {
    const url = `${ENDPOINT}/customers/search`;

    console.log("url", url);
    
    const { data } = await api.get<CustomerSearchResponse>(url, {
        params: {
            search: params?.search || '',
            limit: params?.limit || 50
        }
    });
    return data;
}

export async function getFreight({
    params,
}: getFreightControlProps): Promise<FreightControlResponse>{
    const config: AxiosRequestConfig = {
        params: {
            ...params,
        },
    };
    try{
        const { data } = await api.get<FreightControlResponse>(ENDPOINT, config);

        return data;

    }catch(error: any){
        console.error("Error in registerFuel:", error);
        if (error.response) {
            throw new Error(`Server Error: ${error.response.data.message || 'Unknown error'}`);
        } else if (error.request) {
            throw new Error("Network Error: No response from server");
        } else {
            throw new Error(`Request Error: ${error.message}`);
        }
    }
}


export async function deleteFreight(id: number): Promise<GeneralResponse> {
    const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
    return data;
}

export async function findFreightById(id: number): Promise<FreightControlResource> {
    const response = await api.get<FreightControlResource>(`${ENDPOINT}/${id}`);
    return response.data;
}

export async function storeFreight(data: any): Promise<FreightControlResponse>{
    const response = await api.post<FreightControlResponse>(`${ENDPOINT}`, data);
    return response.data;
}

export async function updateFreight(id: number, data: any): Promise<FreightControlResponse> {
    const response = await api.put<FreightControlResponse>(
        `${ENDPOINT}/${id}`,
        data
    );
    return response. data;
}