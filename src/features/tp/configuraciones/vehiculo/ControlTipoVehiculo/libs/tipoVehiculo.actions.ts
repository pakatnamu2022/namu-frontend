import { api } from "@/core/api";
import { TIPOVEHICULO } from "./tipoVehiculo.constants";
import {
    TipoVehiculoResource,
    TipoVehiculoResponse,
    GetTipoVehiculoProps,
    FormDataResponse,
} from "./tipoVehiculo.interface";
import { AxiosRequestConfig } from "axios";
import { GeneralResponse } from "@/shared/lib/response.interface";

const { ENDPOINT } = TIPOVEHICULO;

export async function getTipoVehiculo({
    params,
}: GetTipoVehiculoProps): Promise<TipoVehiculoResponse> {
    const config: AxiosRequestConfig = {
        params: {
            ...params,
        },
    };

    try {
        const { data } = await api.get<TipoVehiculoResponse>(ENDPOINT, config);
        return data;
    } catch (error: any) {
        console.error("Error in getTipoVehiculo:", error);
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

export async function findTipoVehiculoById(
    id: number
): Promise<TipoVehiculoResource> {
    const response = await api.get<TipoVehiculoResource>(`${ENDPOINT}/${id}`);
    return response.data;
}

export async function storeTipoVehiculo(
    data: any
): Promise<TipoVehiculoResponse> {
    const response = await api.post<TipoVehiculoResponse>(ENDPOINT, data);
    return response.data;
}

export async function updateTipoVehiculo(
    id: number,
    data: any
): Promise<TipoVehiculoResponse> {
    const response = await api.put<TipoVehiculoResponse>(
        `${ENDPOINT}/${id}`,
        data
    );
    return response.data;
}

export async function deleteTipoVehiculo(id: number): Promise<GeneralResponse> {
    const { data } = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
    return data;
}