import { api } from "@/core/api";
import { SUPPLY_CONTROL, SUPPLIER } from "./supplyControl.constants";
import {
    SupplyControlResponse,
    GetSupplyProps,
    SupplyFormSchema,
    SupplyStats,
    SupplyFormData,
    SupplierResource,
    SupplierFormSchema,
    SupplyControlResource,
} from "./supplyControl.interface";
import { GeneralResponse } from "@/shared/lib/response.interface";
import { AxiosRequestConfig } from "axios";

const { ENDPOINT } = SUPPLY_CONTROL;
const { ENDPOINT: SUPPLIER_ENDPOINT } = SUPPLIER;

const parseIsBase = (value: boolean | string | 'all' | undefined): boolean | undefined => {
    if (value === undefined || value === null || value === 'all') {
        return undefined;
    }
    if (typeof value === 'boolean') {
        return value;
    }
    return value === 'true' || value === '1';
};


export async function getSupplies({
    params,
    search,
    vehicle_id,
    driver_id,
    supplier_id,
    is_base,
    date_from,
    date_to,
    page = 1,
    per_page = 15,
}: GetSupplyProps): Promise<SupplyControlResponse> {
    const queryParams: Record<string, any> = {
        page,
        per_page,
        ...params,
    };

    if (search) queryParams.search = search;
    if (vehicle_id) queryParams.vehicle_id = vehicle_id;
    if (driver_id) queryParams.driver_id = driver_id;
    if (supplier_id) queryParams.supplier_id = supplier_id;
    const parsedIsBase = parseIsBase(is_base);
    if (parsedIsBase !== undefined) {
        queryParams.is_base = parsedIsBase;
    }
    if (date_from) queryParams.date_from = date_from;
    if (date_to) queryParams.date_to = date_to;

    const config: AxiosRequestConfig = {
        params: queryParams,
    };

    const response = await api.get<SupplyControlResponse>(ENDPOINT, config);
    return response.data;
}

export async function findSupplyById(id: number): Promise<SupplyControlResource> {
    try {
        const response = await api.get(`${ENDPOINT}/${id}`);
        if (response.data && response.data.data) {
            return response.data.data;
        } else if (response.data) {
            return response.data;
        }

        throw new Error('No se encontraron datos');
    } catch (error: any) {
        throw new Error(error.response?.data?.message || 'Error al obtener el abastecimiento');
    }
}

export async function storeSupply(data: any): Promise<{ data: SupplyControlResource; message: string }> {
    try {
        const payload = {
            ...data,
            is_base: data.is_base === true || data.is_base === 'true' || data.is_base === '1',
        };

        const response = await api.post<{ data: SupplyControlResource; message: string }>(
            ENDPOINT,
            payload
        );
        return response.data;
    } catch (error: any) {
        console.error('[storeSupply] Error response:', error.response?.data);
        throw error;
    }
}


export async function updateSupply(
    id: number,
    data: Partial<SupplyFormSchema>
): Promise<{ data: SupplyControlResource; message: string }> {
    const response = await api.put<{ data: SupplyControlResource; message: string }>(
        `${ENDPOINT}/${id}`,
        data
    );
    return response.data;
}

export async function deleteSupply(id: number): Promise<GeneralResponse> {
    const response = await api.delete<GeneralResponse>(`${ENDPOINT}/${id}`);
    return response.data;
}

export async function getSupplyStats(): Promise<SupplyStats> {
    const response = await api.get<SupplyStats>(`${ENDPOINT}/stats`);
    return response.data;
}

export async function getSupplyFormData(): Promise<SupplyFormData> {
    const response = await api.get<SupplyFormData>(`${ENDPOINT}/form/data`);
    return response.data;
}

export async function getSuppliers(params?: {
    search?: string;
    active_only?: boolean;
    page?: number;
    per_page?: number;
}): Promise<{ data: SupplierResource[]; meta: any; links: any }> {
    const config: AxiosRequestConfig = {
        params: {
            ...params,
        },
    };
    const response = await api.get<{ data: SupplierResource[]; meta: any; links: any }>(
        SUPPLIER_ENDPOINT,
        config
    );
    return response.data;
}

export async function getActiveSuppliers(): Promise<SupplierResource[]> {
    const response = await api.get<SupplierResource[]>(
        `${SUPPLIER_ENDPOINT}/active`
    );
    return response.data;
}

export async function findSupplierById(id: number): Promise<SupplierResource> {
    const response = await api.get<{ data: SupplierResource }>(
        `${SUPPLIER_ENDPOINT}/${id}`
    );
    return response.data.data;
}

export async function storeSupplier(data: SupplierFormSchema): Promise<{ data: SupplierResource; message: string }> {
    const response = await api.post<{ data: SupplierResource; message: string }>(
        SUPPLIER_ENDPOINT,
        data
    );
    return response.data;
}

export async function updateSupplier(
    id: number,
    data: Partial<SupplierFormSchema>
): Promise<{ data: SupplierResource; message: string }> {
    const response = await api.put<{ data: SupplierResource; message: string }>(
        `${SUPPLIER_ENDPOINT}/${id}`,
        data
    );
    return response.data;
}

export async function deleteSupplier(id: number): Promise<GeneralResponse> {
    const response = await api.delete<GeneralResponse>(`${SUPPLIER_ENDPOINT}/${id}`);
    return response.data;
}

export async function downloadTicketPhoto(photoId: number, fileName?: string): Promise<void> {
    try {

        const response = await api.get(
            `/tp/comercial/supply/photo/${photoId}/download`,
            {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/octet-stream',
                },
            }
        );

        const blob = response.data;
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName || `ticket_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);

    } catch (error: any) {
        console.error('Error al descargar la foto:', error);
        throw new Error(
            error.response?.data?.message ||
            error.message ||
            'Error al descargar la foto del ticket');
    }
}

export async function uploadTicketPhoto(
    id: number,
    photo: string
): Promise<{ message: string }> {
    try {
        const response = await api.post<{ message: string }>(
            `${ENDPOINT}/${id}/upload-ticket`,
            { photo }
        );
        return response.data;
    } catch (error: any) {
        console.error('[uploadTicketPhoto] Error response:', error.response?.data);
        throw error;
    }
}
