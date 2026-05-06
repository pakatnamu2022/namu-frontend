// travelControl.actions.ts - Añadir funciones para SubTrips

import { api } from "@/core/api";
import { ApiResponse, GetTripsProps, TripStatus, UpdateSubTripParams, UpdateSubTripResponse, SubTrip, SubTripStatus, UpdateMileageParams } from "./travelControl.interface";
import { TravelControlResource, TravelControlResponse } from "./travelControl.interface";
import { TRAVEL_CONTROL } from "../controlViajesType/travelControl.constants";
import { AxiosRequestConfig } from "axios";

const { ENDPOINT } = TRAVEL_CONTROL;

export async function getTravels({
    params,
    search,
    status,
    page = 1,
    per_page = 15
}: GetTripsProps): Promise<TravelControlResponse> {
    const queryParams: Record<string, any> = {
        page,
        per_page,
        ...params
    };
    
    if (search) queryParams.search = search;
    if (status && status !== 'all') {
        queryParams.status = status;
    }

    const config: AxiosRequestConfig = {
        params: queryParams,
    };

    const response = await api.get<TravelControlResponse>(ENDPOINT, config);
    return response.data;
}

export async function findTravelById(id: string): Promise<TravelControlResource> {
    const response = await api.get<{ data: TravelControlResource }>(`/${ENDPOINT}/${id}`);
    return response.data.data;
}

export async function updateTravel(id: string, data: any): Promise<TravelControlResource> {
    const response = await api.put<{ data: TravelControlResource }>(`${ENDPOINT}/${id}`, data);
    return response.data.data;
}

export async function startRoute(params: {
    id: string;
    mileage: number;
    notes?: string;
}): Promise<TravelControlResource> {
    const response = await api.post<{ data: TravelControlResource }>(
        `${ENDPOINT}/${params.id}/start`, 
        {
            mileage: params.mileage,
            notes: params.notes
        }
    );
    return response.data.data;
}

export async function endRoute(params: {
    id: string;
    mileage: number;
    notes?: string;
    tonnage?: number;
}): Promise<TravelControlResource> {
    const response = await api.post<{ data: TravelControlResource }>(
        `${ENDPOINT}/${params.id}/end`,
        {
            mileage: params.mileage,
            notes: params.notes,
            tonnage: params.tonnage
        }
    );
    return response.data.data;
}

export async function registerFuel(params: {
    id: string;
    kmFactor: number;
    notes?: string;
    invoice_travel?: string;
    documentNumber?: string;
    vatNumber?: string;
}): Promise<{ travel: TravelControlResource; fuel: any }> {
    try {
        const response = await api.post<{ 
            data: { 
                travel: TravelControlResource; 
                fuel: any 
            } 
        }>(`${ENDPOINT}/${params.id}/fuel`, {
            kmFactor: params.kmFactor,
            notes: params.notes,
            invoice_travel: params.invoice_travel,
            vatNumber: null,
        });
        return response.data.data;
    } catch (error: any) {
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

export async function changeStatus(params: {
    id: string;
    state: TripStatus;
    notes?: string;
}): Promise<TravelControlResource> {
    const response = await api.post<{ data: TravelControlResource }>(
        `${ENDPOINT}/${params.id}/state`, 
        {
            state: params.state,
            notes: params.notes
        }
    );
    return response.data.data;
}

export async function getDriverRegistries(tripId: string): Promise<ApiResponse<any[]>> {
    const response = await api.get<{ data: any[] }>(`${ENDPOINT}/${tripId}/records`);
    return response.data;
}

export async function getAvailableStatuses(): Promise<ApiResponse<any[]>> {
    const response = await api.get<{ data: any[] }>(`${ENDPOINT}/filters/states`);
    return response.data;
}

export async function validateMileage(vehicleId: string | number): Promise<ApiResponse<{
    ultimo_kilometraje: number;
    mensaje: string;
}>> {
    const response = await api.get<ApiResponse<{
        ultimo_kilometraje: number;
        mensaje: string;
    }>>(`${ENDPOINT}/validate-mileage/${vehicleId}`);
    
    return response.data;
}

export async function getLastMileage(vehicleId: string): Promise<number> {
    try {
        const data = await validateMileage(vehicleId);
        return data.data?.ultimo_kilometraje || 0;
    } catch (error) {
        console.error('Error obteniendo último kilometraje:', error);
        return 0;
    }
}

// ==================== NUEVAS FUNCIONES PARA SUBTRIPS ====================

/**
 * Obtener todos los SubTrips de un viaje específico
 * @param dispatchId - ID del viaje principal (despacho_id)
 */
export async function getSubTrips(dispatchId: string): Promise<SubTrip[]> {
    try {
        const response = await api.get<{ data: SubTrip[] }>(
            `${ENDPOINT}/${dispatchId}/subtrips`
        );
        return response.data.data;
    } catch (error: any) {
        console.error("Error obteniendo subtrips:", error);
        throw new Error(error.response?.data?.message || "Error al obtener los tramos del viaje");
    }
}

/**
 * Actualizar un SubTrip específico
 * @param params - Parámetros de actualización
 */
export async function updateSubTrip(params: UpdateSubTripParams): Promise<UpdateSubTripResponse> {
    try {
        const response = await api.put<{ data: SubTrip; message: string }>(
            `${ENDPOINT}/subtrips/${params.id}`,
            {
                status: params.status,
                initial_km: params.initialKm,
                final_km: params.finalKm,
                total_km: params.totalKm,
                total_hours: params.totalHours,
                start_time: params.startTime,
                end_time: params.endTime,
                notes: params.notes,
            }
        );
        return {
            data: response.data.data,
            message: response.data.message,
        };
    } catch (error: any) {
        console.error("Error actualizando subtrip:", error);
        throw new Error(error.response?.data?.message || "Error al actualizar el tramo");
    }
}

/**
 * Actualizar múltiples SubTrips a la vez (útil para batch operations)
 * @param dispatchId - ID del viaje principal
 * @param subTrips - Array de SubTrips a actualizar
 */
export async function updateMultipleSubTrips(
    dispatchId: string,
    subTrips: Array<{ id: string; status?: SubTripStatus; initialKm?: number; finalKm?: number; }>
): Promise<{ data: SubTrip[]; message: string }> {
    try {
        const response = await api.put<{ data: SubTrip[]; message: string }>(
            `${ENDPOINT}/${dispatchId}/subtrips/batch`,
            { subTrips }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error actualizando múltiples subtrips:", error);
        throw new Error(error.response?.data?.message || "Error al actualizar los tramos");
    }
}

/**
 * Obtener el estado de progreso de los SubTrips
 * @param dispatchId - ID del viaje principal
 */
export async function getSubTripsProgress(dispatchId: string): Promise<{
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
    locked: number;
    percentage: number;
}> {
    try {
        const response = await api.get<{ data: {
            total: number;
            completed: number;
            in_progress: number;
            pending: number;
            locked: number;
            percentage: number;
        } }>(`${ENDPOINT}/${dispatchId}/subtrips/progress`);
        
        return {
            total: response.data.data.total,
            completed: response.data.data.completed,
            inProgress: response.data.data.in_progress,
            pending: response.data.data.pending,
            locked: response.data.data.locked,
            percentage: response.data.data.percentage,
        };
    } catch (error: any) {
        console.error("Error obteniendo progreso:", error);
        return {
            total: 0,
            completed: 0,
            inProgress: 0,
            pending: 0,
            locked: 0,
            percentage: 0,
        };
    }
}

// ==================== FUNCIONES PARA SEGMENTOS (SUBTRIPS) ====================

/**
 * Iniciar un segmento específico del viaje
 */
export async function startSegment(params: {
    travelId: string;
    segmentId: string;
    mileage: number;
    latitude?: number | null;
    longitude?: number | null;
}): Promise<{ success: boolean; data: any; message: string }> {
    try {
        const response = await api.post<{ success: boolean; data: any; message: string }>(
            `${ENDPOINT}/${params.travelId}/segments/${params.segmentId}/start`,
            {
                mileage: params.mileage,
                latitude: params.latitude,
                longitude: params.longitude,
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error starting segment:", error);
        throw new Error(error.response?.data?.message || "Error al iniciar el tramo");
    }
}

/**
 * Finalizar un segmento específico del viaje
 */
export async function endSegment(params: {
    travelId: string;
    segmentId: string;
    mileage: number;
    latitude?: number | null;
    longitude?: number | null;
    tonnage?: number;
}): Promise<{ success: boolean; data: any; message: string; all_completed: boolean }> {
    try {
        const response = await api.post<{ success: boolean; data: any; message: string; all_completed: boolean }>(
            `${ENDPOINT}/${params.travelId}/segments/${params.segmentId}/end`,
            {
                mileage: params.mileage,
                latitude: params.latitude,
                longitude: params.longitude,
                tonnage: params.tonnage,
            }
        );
        return response.data;
    } catch (error: any) {
        console.error("Error ending segment:", error);
        throw new Error(error.response?.data?.message || "Error al finalizar el tramo");
    }
}

/**
 * Obtener todos los segmentos de un viaje
 */
export async function getSegments(travelId: string): Promise<any[]> {
    try {
        const response = await api.get<{ success: boolean; data: any[] }>(
            `${ENDPOINT}/${travelId}/segments`
        );
        return response.data.data;
    } catch (error: any) {
        console.error("Error getting segments:", error);
        throw new Error(error.response?.data?.message || "Error al obtener los tramos");
    }
}

export async function exportSummaryReport(
    format: 'excel' | 'pdf' = 'excel',
    filters?: {
        status?: string;
        search?: string;
    }
): Promise<any> {
    try {
        const response = await api.post(
            `${ENDPOINT}/export/summary`,
            { format, ...filters },
            { responseType: 'blob' }
        );

        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        const contentDisposition = response.headers['content-disposition'];
        let filename = `reporte_resumido_viajes_${new Date().getTime()}`;

        if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
            if (filenameMatch && filenameMatch[1]) {
                filename = filenameMatch[1].replace(/['"]/g, '');
            }
        } else {
            const extension = format === 'pdf' ? 'pdf' : 'xlsx';
            filename = `reporte_resumido_viajes_${new Date().getTime()}.${extension}`;
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        return response.data;
    } catch (error: any) {
        console.error('Error exporting summary report:', error);
        throw new Error(error.response?.data?.message || 'Error al exportar el reporte resumido');
    }
}

export async function exportAllTravelsReport(
    format: 'excel' | 'pdf' = 'excel',
    filters?: {
        status?: string;
        date_from?: string;
        date_to?: string;
        search?: string;
    }
): Promise<any>{
    try {
    const response = await api.post(
      `${ENDPOINT}/export/all`,
      { format, ...filters },
      {
        responseType: 'blob',
      }
    );

    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Extraer el nombre del archivo del header Content-Disposition
    const contentDisposition = response.headers['content-disposition'];
    let filename = `reporte_viajes_${new Date().getTime()}`;

    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(
        /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
      );
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1].replace(/['"]/g, '');
      }
    } else {
      const extension = format === 'pdf' ? 'pdf' : 'xlsx';
      filename = `reporte_viajes_${new Date().getTime()}.${extension}`;
    }

    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();

    // Liberar el objeto URL
    window.URL.revokeObjectURL(url);

    return response.data;
  } catch (error: any) {
    console.error('Error exporting all travels report:', error);
    throw new Error(error.response?.data?.message || 'Error al exportar el reporte general');
  }
}

export async function exportTravelReport(
    travelId: string,
    format: 'excel' | 'pdf' = 'excel'
): Promise<any>{
    try{
        const response = await api.post(
            `${ENDPOINT}/${travelId}/export`,
            {format},
            {
                responseType: 'blob',
            }  
        );

         // Crear un enlace temporal para descargar el archivo
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;

        // Extraer el nombre del archivo del header Content-Disposition
        const contentDisposition = response.headers['content-disposition'];
        let filename = `reporte_viaje_${travelId}`;

        if (contentDisposition) {
        const filenameMatch = contentDisposition.match(
            /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/
        );
        if (filenameMatch && filenameMatch[1]) {
            filename = filenameMatch[1].replace(/['"]/g, '');
        }
        } else {
        const extension = format === 'pdf' ? 'pdf' : 'xlsx';
        filename = `reporte_viaje_${travelId}_${new Date().getTime()}.${extension}`;
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.remove();

        // Liberar el objeto URL
        window.URL.revokeObjectURL(url);

        return response.data;
    } catch (error: any) {
        console.error('Error exporting travel report:', error);
        throw new Error(error.response?.data?.message || 'Error al exportar el reporte');
    }
    
}

/**
 * Obtener el progreso de los segmentos
 */
export async function getSegmentsProgress(travelId: string): Promise<{
    total: number;
    completed: number;
    in_progress: number;
    pending: number;
    locked: number;
    percentage: number;
}> {
    try {
        const response = await api.get<{ success: boolean; data: {
            total: number;
            completed: number;
            in_progress: number;
            pending: number;
            locked: number;
            percentage: number;
        } }>(`${ENDPOINT}/${travelId}/segments/progress`);
        return response.data.data;
    } catch (error: any) {
        console.error("Error getting segments progress:", error);
        return {
            total: 0,
            completed: 0,
            in_progress: 0,
            pending: 0,
            locked: 0,
            percentage: 0,
        };
    }
}

export async function updateTravelMileage(params: UpdateMileageParams) : Promise<TravelControlResource>{
    const response = await api.put<{ data: TravelControlResource }>(
        `${ENDPOINT}/${params.id}/mileage`,
        {

            general_initial_km: params.general_initial_km,
            general_final_km: params.general_final_km,
            segments: params.segments,

        } 
    );

    return response.data.data;
        
    
}