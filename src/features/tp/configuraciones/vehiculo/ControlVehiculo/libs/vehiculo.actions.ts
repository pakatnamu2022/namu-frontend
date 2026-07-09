import { api } from "@/core/api";
import { VEHICULO } from "./vehiculo.constants";
import {
    VehiculoResource,
    VehiculoResponse,
    GetVehiculoProps,
    FormDataResponse,
} from "./vehiculo.interface";
import { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface";

const { ENDPOINT } = VEHICULO;

export async function getVehiculos({
    params,
}: GetVehiculoProps): Promise<VehiculoResponse> {
    const config: AxiosRequestConfig = {
        params: {
            ...params,
        },
    };

    try {
        const { data } = await api.get<VehiculoResponse>(ENDPOINT, config);
        return data;
    } catch (error: any) {
        if (error.response) {
            throw new Error(
                `Server Error: ${error.response.data.message || "Unknown error"}`
            );
        } else if (error.request) {
            throw new Error("Network Error: No response from server");
        } else {
            throw new Error(`Request Error: ${error.message}`);
        }
    }
}

export async function getFormData(): Promise<FormDataResponse> {
    const { data } = await api.get<FormDataResponse>(`${ENDPOINT}/form/data`);
    return data;
}

export async function findVehiculoById(
    id: number
): Promise<VehiculoResource> {
    const response = await api.get<VehiculoResource>(`${ENDPOINT}/${id}`);
    return response.data;
}

export async function storeVehiculo(
    data: any
): Promise<VehiculoResponse> {
    const response = await api.post<VehiculoResponse>(ENDPOINT, data);
    return response.data;
}

export async function updateVehiculo(
    id: number,
    data: any
): Promise<VehiculoResponse> {
    const response = await api.put<VehiculoResponse>(
        `${ENDPOINT}/${id}`,
        data
    );
    return response.data;
}

export async function deleteVehiculo(id: number): Promise<GeneralResponse> {
    const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
    return data;
}

export async function changeVehiculoStatus(
    id: number,
    status: number
): Promise<GeneralResponse> {
    const { data } = await api.post<GeneralResponse>(
        `${ENDPOINT}/${id}/change-status`,
        { status }
    );
    return data;
}