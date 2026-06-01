import { api } from "@/core/api";


export interface LocationData {
    device_id: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    battery_level?: number;
    timestamp?: string;
}

export interface LocationResponse {
    success: boolean;
    message: string;
    data?: {
        driver_id: number;
        reported_at: string;
        status: string;
    }
}


//enviar ubicacion actual al backend

export async function sendLocation(location: LocationData): Promise<LocationResponse> {
    try {
        const response = await api.post<LocationResponse>("/tp/comercial/public/monitoreo/location", {
            device_id: location.device_id,
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy,
            speed: location.speed,
            battery_level: location.battery_level,
            timestamp: new Date().toISOString(),
        }
        );
        return response.data;

    } catch (error: any) {
        console.error("Error enviando ubicación:", error);
        throw new Error(error.response?.data?.message || "Error al enviar ubicación");
    }


}

/**
 * Obtener la configuración actual (intervalo, umbrales)
 */
export async function getLocationConfig(key: string): Promise<any> {
    try {
        const response = await api.get<{ success: boolean; key: string; value: any }>(
            `/tp/comercial/public/monitoreo/config/${key}`
        );
        return response.data.value;
    } catch (error) {
        console.error("Error obteniendo configuración:", error);
        return null;
    }
}

/**
 * Verificar si el dispositivo está registrado
 */
export async function checkDevice(deviceId: string): Promise<{ success: boolean; data?: any }> {
    try {
        const response = await api.get<{ success: boolean; data: any }>(
            `/tp/comercial/public/monitoreo/device/${deviceId}/check`
        );
        return response.data;
    } catch (error) {
        return { success: false };
    }
}