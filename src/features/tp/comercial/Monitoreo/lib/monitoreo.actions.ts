import { api } from "@/core/api";
import {
    DriversResponse,
    DriversStats,
    DriverLocation,
    DriverLocationConfiguration,
    DriverStatusLog,
    GetDriversProps,
    GetLocationsProps,
    GetStatusLogsProps,
    LocationsResponse,
    StatusLogsResponse,
    DeviceStatusResponse,
    RegisterDeviceResponse,
    ValidateSerialResponse,
} from "./monitoreo.interface";
import { MONITOREO } from "./monitoreo.constants";

const { ENDPOINT } = MONITOREO;

// ============================================================
// CONDUCTORES
// ============================================================

export async function getDrivers({
    search,
    status,
    page = 1,
    per_page = 15,
}: GetDriversProps): Promise<DriversResponse> {
    const params: Record<string, any> = {
        page,
        per_page,
    };

    if (search) params.search = search;
    if (status && status !== "all") params.status = status;

    const response = await api.get<{ success: boolean; data: DriversResponse }>(`${ENDPOINT}/drivers`, { params });
    return response.data.data;
}

export async function getDriverStats(): Promise<DriversStats> {
    const response = await api.get<{ data: DriversStats }>(`${ENDPOINT}/drivers/stats`);
    return response.data.data;
}

export async function assignDevice(driverId: number, deviceId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
        `${ENDPOINT}/drivers/${driverId}/assign-device`,
        { device_id: deviceId }
    );
    return response.data;
}

export async function removeDevice(driverId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
        `${ENDPOINT}/drivers/${driverId}/remove-device`
    );
    return response.data;
}

export async function refreshDriverStatus(driverId: number): Promise<{ success: boolean; message: string; data: any }> {
    const response = await api.post<{ success: boolean; message: string; data: any }>(
        `${ENDPOINT}/drivers/${driverId}/refresh-status`
    );
    return response.data;
}

// ============================================================
// UBICACIONES
// ============================================================

export async function getLatestLocations(): Promise<DriverLocation[]> {
    const response = await api.get<{ success: boolean; data: DriverLocation[] }>(
        `${ENDPOINT}/locations/latest`
    );
    return response.data.data;
}

export async function getLocations({
    driver_id,
    from_date,
    to_date,
    page = 1,
    per_page = 50,
}: GetLocationsProps): Promise<LocationsResponse> {
    const params: Record<string, any> = {
        page,
        per_page,
    };

    if (driver_id) params.driver_id = driver_id;
    if (from_date) params.from_date = from_date;
    if (to_date) params.to_date = to_date;

    const response = await api.get<LocationsResponse>(`${ENDPOINT}/locations`, { params });
    return response.data;
}

export async function getLocationByDriverId(driverId: number): Promise<DriverLocation | null> {
    try {

        if (!driverId || driverId <= 0) {
            return null;
        }

        const response = await api.get<{ success: boolean; data: DriverLocation }>(
            `${ENDPOINT}/locations/${driverId}`
        );
        return response.data.data;
    } catch (error: any) {
        if (error.response?.status === 400) {
            return null;
        }
        console.error("Error getting location by driver:", error);
        return null;
    }
}

// ============================================================
// CONFIGURACIONES
// ============================================================

export async function getConfigurations(): Promise<DriverLocationConfiguration[]> {
    const response = await api.get<{ success: boolean; data: DriverLocationConfiguration[] }>(
        `${ENDPOINT}/config`
    );
    return response.data.data;
}

export async function getConfiguration(key: string): Promise<DriverLocationConfiguration | null> {
    try {
        const response = await api.get<{ success: boolean; data: DriverLocationConfiguration }>(
            `${ENDPOINT}/config/${key}`
        );
        return response.data.data;
    } catch (error) {
        return null;
    }
}

export async function updateConfiguration(
    key: string,
    value: any,
    description?: string
): Promise<DriverLocationConfiguration> {
    const response = await api.put<{ success: boolean; data: DriverLocationConfiguration }>(
        `${ENDPOINT}/config/${key}`,
        { value, description }
    );
    return response.data.data;
}

// ============================================================
// LOGS DE ESTADO
// ============================================================

export async function getStatusLogs({
    driver_id,
    status,
    from_date,
    to_date,
    page = 1,
    per_page = 50,
}: GetStatusLogsProps): Promise<StatusLogsResponse> {
    const params: Record<string, any> = {
        page,
        per_page,
    };

    if (driver_id) params.driver_id = driver_id;
    if (status) params.status = status;
    if (from_date) params.from_date = from_date;
    if (to_date) params.to_date = to_date;

    const response = await api.get<StatusLogsResponse>(`${ENDPOINT}/status-logs`, { params });
    return response.data;
}

export async function getStatusLogsByDriver(driverId: number): Promise<DriverStatusLog[]> {
    const response = await api.get<{ success: boolean; data: DriverStatusLog[] }>(
        `${ENDPOINT}/status-logs/driver/${driverId}`
    );
    return response.data.data;
}

// ============================================================
// ESTADO DEL DISPOSITIVO DEL CONDUCTOR
// ============================================================

/**
 * Obtener el estado del dispositivo del conductor
 */
export async function getDeviceStatus(): Promise<DeviceStatusResponse> {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            return { is_active: false, serial: null, equipment_id: null, equipment_name: null };
        }
        const response = await api.get<{ success: boolean; data: DeviceStatusResponse }>(
            `${ENDPOINT}/device/status`
        );
        return response.data.data;
    } catch (error) {
        console.warn("Error obteniendo estado del dispositivo:", error);
        return { is_active: false, serial: null, equipment_id: null, equipment_name: null };
    }
}

/**
 * Registrar/activar dispositivo
 */
export async function registerDevice(serial: string): Promise<RegisterDeviceResponse> {
    const response = await api.post<RegisterDeviceResponse>(
        `${ENDPOINT}/device/register`,
        { serial }
    );
    return response.data;
}

/**
 * Desactivar dispositivo
 */
export async function unregisterDevice(): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
        `${ENDPOINT}/device/unregister`
    );
    return response.data;
}

/**
 * Validar serial 
 */
export async function validateSerial(serial: string): Promise<ValidateSerialResponse> {
    try {
        const response = await api.post<ValidateSerialResponse>(
            `${ENDPOINT}/device/validate-serial`,
            { serial }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            valid: false,
            message: error.response?.data?.message || "Error al validar el dispositivo"
        };
    }
}

/**
 * Obtener información del equipo por serial
 */
export async function getEquipmentBySerial(serial: string): Promise<any> {
    const response = await api.post<{ success: boolean; data: any }>(
        `${ENDPOINT}/device/equipment`,
        { serial }
    );
    return response.data.data;
}


/**
 * Obtener estado del dispositivo de un conductor específico (para admin)
 */
export async function getDriverDeviceStatus(driverId: number): Promise<DeviceStatusResponse> {
    const response = await api.get<{ success: boolean; data: DeviceStatusResponse }>(
        `${ENDPOINT}/drivers/${driverId}/device`
    );
    return response.data.data;
}

/**
 * Asignar dispositivo a un conductor (admin)
 */
export async function adminAssignDevice(driverId: number, serial: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
        `${ENDPOINT}/drivers/${driverId}/assign-device`,
        { device_id: serial }
    );
    return response.data;
}

/**
 * Remover dispositivo de un conductor (admin)
 */
export async function adminRemoveDevice(driverId: number): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>(
        `${ENDPOINT}/drivers/${driverId}/remove-device`
    );
    return response.data;
}

/**
 * Validar serial para asignación (admin)
 */
export async function adminValidateSerial(serial: string): Promise<ValidateSerialResponse> {
    try {
        const response = await api.post<ValidateSerialResponse>(
            `${ENDPOINT}/device/validate-serial`,
            { serial }
        );
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            valid: false,
            message: error.response?.data?.message || "Error al validar el dispositivo"
        };
    }
}

export async function autoActivateDevice(): Promise<{
    success: boolean;
    message: string;
    data?: {
        is_active: boolean;
        serial: string;
        equipment_name: string;
        equipment_id: number;
    };
}> {
    try {
        const response = await api.post<{
            success: boolean;
            message: string;
            data: any;
        }>(`${ENDPOINT}/device/auto-activate`);
        return response.data;
    } catch (error: any) {
        return {
            success: false,
            message: error.response?.data?.message || "Error al activar dispositivo"
        };
    }
}
