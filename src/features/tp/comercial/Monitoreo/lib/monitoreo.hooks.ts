import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    adminAssignDevice,
    adminRemoveDevice,
    adminValidateSerial,
    assignDevice,
    autoActivateDevice,
    getDeviceStatus,
    getDriverStats,
    getDrivers,
    getEquipmentBySerial,
    getLatestLocations,
    getLocationByDriverId,
    getLocationHistory,
    getLocations,
    getStatusLogs,
    getStatusLogsByDriver,
    refreshDriverStatus,
    registerDevice,
    removeDevice,
    unregisterDevice,
    validateSerial,
} from "./monitoreo.actions";
import {
    DriverLocation,
    DriversResponse,
    DriversStats,
    DriverStatusLog,
    GetDriversProps,
    GetLocationsProps,
    GetStatusLogsProps,
    HistoryPoint,
    LocationTrackerState,
    UseRouteHistoryProps,
} from "./monitoreo.interface";
import { MONITOREO } from "./monitoreo.constants";
import { errorToast, successToast } from "@/core/core.function";
import { useCallback, useEffect, useRef, useState } from "react";
import { getLocationConfig, sendLocation } from "./monitoreoLocation.actions";

const { QUERY_KEY } = MONITOREO;

interface UseLocationTrackerProps {
    deviceId: string; //id unico del dispositivo (almacenado localmente)
    intervalMinutes?: number; //intervalo en minutos (por defecto 2)
    enabled?: boolean; //si el tracking está activo o no
}

// ============================================================
// QUERIES
// ============================================================

export const useDrivers = (props?: GetDriversProps) => {
    return useQuery<DriversResponse>({
        queryKey: [QUERY_KEY, "drivers", props],
        queryFn: () => getDrivers(props || {}),
        refetchOnWindowFocus: true,
        refetchInterval: 10000, // Refrescar cada 10 segundos
        staleTime: 5000,
    });
};

export const useDriverStats = () => {
    return useQuery<DriversStats>({
        queryKey: [QUERY_KEY, "stats"],
        queryFn: getDriverStats,
        refetchOnWindowFocus: true,
        refetchInterval: 10000, // Refrescar cada 10 segundos
        staleTime: 5000,
    });
};

export const useLatestLocations = () => {
    return useQuery<DriverLocation[]>({
        queryKey: [QUERY_KEY, "locations", "latest"],
        queryFn: getLatestLocations,
        refetchOnWindowFocus: true,     // ← Cambiar a true
        refetchInterval: 10000,          // ← Cambiar a 10 segundos
        staleTime: 5000,
    });
};

export const useLocations = (props?: GetLocationsProps) => {
    return useQuery({
        queryKey: [QUERY_KEY, "locations", props],
        queryFn: () => getLocations(props || {}),
        refetchOnWindowFocus: false,
        enabled: !!props?.driver_id,
    });
};

export const useLocationByDriver = (driverId?: number) => {
    return useQuery<DriverLocation | null>({
        queryKey: [QUERY_KEY, "location", driverId],
        queryFn: () => getLocationByDriverId(driverId!),
        enabled: !!driverId && driverId > 0,
        refetchOnWindowFocus: true,
        refetchInterval: 15000,
        staleTime: 0,
    });
};

export const useStatusLogs = (props?: GetStatusLogsProps) => {
    return useQuery({
        queryKey: [QUERY_KEY, "status-logs", props],
        queryFn: () => getStatusLogs(props || {}),
        refetchOnWindowFocus: false,
        enabled: !!props?.driver_id,
    });
};

export const useStatusLogsByDriver = (driverId?: number) => {
    return useQuery<DriverStatusLog[]>({
        queryKey: [QUERY_KEY, "status-logs", "driver", driverId],
        queryFn: () => getStatusLogsByDriver(driverId!),
        enabled: !!driverId,
        refetchOnWindowFocus: false,
    });
};

// ============================================================
// MUTATIONS
// ============================================================

export const useAssignDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ driverId, deviceId }: { driverId: number; deviceId: string }) =>
            assignDevice(driverId, deviceId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "drivers"] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "location", variables.driverId] });
            successToast("Dispositivo asignado correctamente");
        },
        onError: (error: any) => {
            errorToast(error?.message || "Error al asignar dispositivo");
        },
    });
};

export const useRemoveDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ driverId }: { driverId: number }) => removeDevice(driverId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "drivers"] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "location", variables.driverId] });
            successToast("Dispositivo removido correctamente");
        },
        onError: (error: any) => {
            errorToast(error?.message || "Error al remover dispositivo");
        },
    });
};

export const useRefreshDriverStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ driverId }: { driverId: number }) => refreshDriverStatus(driverId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "drivers"] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "location", variables.driverId] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "status-logs", "driver", variables.driverId] });
            successToast("Estado actualizado correctamente");
        },
        onError: (error: any) => {
            errorToast(error?.message || "Error al actualizar estado");
        },
    });
};




const GEOLOCATION_OPTIONS: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
};
const DEVICE_VERIFICATION_INTERVAL_MS = 60 * 60 * 1000;
const DEFAULT_INTERVAL_MINUTES = 2;
const LOW_ACCURACY_THRESHOLD = 500;
const RETRY_DELAY_MS = 5000;


export function useLocationTracker({
    deviceId,
    intervalMinutes = DEFAULT_INTERVAL_MINUTES,
    enabled = true,
}: UseLocationTrackerProps) {

    const [state, setState] = useState<LocationTrackerState>({
        isTracking: false,
        lastLocation: null,
        error: null,
        isDeviceValid: false,
    });

    const intervalRef = useRef<number | null>(null);
    const retryTimeoutRef = useRef<number | null>(null);
    const isMountedRef = useRef(true);

    const updateState = useCallback((updates: Partial<LocationTrackerState>) => {
        if (isMountedRef.current) {
            setState(prev => ({ ...prev, ...updates }));
        }
    }, []);

    // Obtener ubicación actual
    const getCurrentPosition = useCallback((): Promise<GeolocationPosition> => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error("Geolocalización no soportada"));
                return;
            }

            navigator.geolocation.getCurrentPosition(resolve, reject, GEOLOCATION_OPTIONS);
        });
    }, []);

    // Obtener nivel de batería
    const getBatteryLevel = useCallback(async (): Promise<number | undefined> => {
        if (!("getBattery" in navigator)) return undefined;

        try {
            const battery = await (navigator as any).getBattery();
            return battery.level * 100;

        } catch {
            return undefined;
        }
    }, []);

    // Enviar ubicación al servidor
    const sendLocationToServer = useCallback(async () => {
        if (!state.isDeviceValid || !isMountedRef.current) return;

        try {
            const position = await getCurrentPosition();

            if (position.coords.accuracy > LOW_ACCURACY_THRESHOLD) {
                retryTimeoutRef.current = window.setTimeout(() => {
                    sendLocationToServer();
                }, RETRY_DELAY_MS);
                return;
            }


            const batteryLevel = await getBatteryLevel();

            updateState({
                lastLocation: position,
                error: null
            });

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);
            await sendLocation({
                device_id: deviceId,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                speed: position.coords.speed ?? undefined,
                battery_level: batteryLevel,
            });
            clearTimeout(timeoutId);
        } catch (err: any) {
            console.error("Error obteniendo ubicación:", err);
            if (isMountedRef.current) {
                updateState({ error: err.message });
            }
        }
    }, [deviceId, getCurrentPosition, getBatteryLevel, state.isDeviceValid, updateState]);

    // Verificar si el dispositivo está registrado
    const verifyDevice = useCallback(async () => {
        if (!deviceId) return false;

        try {
            if (deviceId && deviceId.length > 0) {
                updateState({
                    isDeviceValid: true,
                    error: null,
                });
                return true;
            } else {
                updateState({
                    isDeviceValid: false,
                    error: 'No hay dispositivo registrado'
                });
                return false;
            }

        } catch (error) {
            updateState({
                isDeviceValid: false,
                error: 'Error verificando dispositivo',
            });
            return false;
        }
    }, [deviceId, updateState]);

    // Iniciar el tracking
    const startTracking = useCallback(async () => {
        if (!enabled || !deviceId) return;

        if (retryTimeoutRef.current) {
            clearTimeout(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        const isValid = await verifyDevice();
        if (!isValid) return;

        // Obtener intervalo desde el servidor
        let interval = intervalMinutes;
        try {
            const serverInterval = await getLocationConfig("location_interval_minutes");
            if (serverInterval && typeof serverInterval === 'number') {
                interval = serverInterval;
            }
        } catch (error) {
            console.warn("Usando intervalo por defecto:", interval);
        }

        const intervalMs = interval * 60 * 1000;

        // Enviar ubicación inmediatamente al iniciar
        await sendLocationToServer();

        // Configurar intervalo para envíos periódicos
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = window.setInterval(sendLocationToServer, intervalMs);

        updateState({ isTracking: true, error: null });
    }, [enabled, deviceId, verifyDevice, sendLocationToServer, intervalMinutes, updateState]);

    // Detener el tracking
    const stopTracking = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }

        if (retryTimeoutRef.current) {
            clearInterval(retryTimeoutRef.current);
            retryTimeoutRef.current = null;
        }

        updateState({ isTracking: false });
    }, [updateState]);

    // Efecto para iniciar/detener tracking
    useEffect(() => {
        if (enabled && deviceId) {
            startTracking();
        } else {
            stopTracking();
        }

        return () => {
            stopTracking();
        };
    }, [enabled, deviceId, startTracking, stopTracking]);

    // Re-verificar dispositivo periódicamente (cada hora)
    useEffect(() => {
        if (!enabled || !deviceId || !state.isTracking) return;

        const verifyInterval = setInterval(() => {
            verifyDevice();
        }, DEVICE_VERIFICATION_INTERVAL_MS); // Cada hora

        return () => clearInterval(verifyInterval);
    }, [enabled, deviceId, state.isTracking, verifyDevice]);

    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        }
    }, []);

    const sendLocationNow = useCallback(() => {
        sendLocationToServer();
    }, [sendLocationToServer]);

    return {
        isTracking: state.isTracking,
        isDeviceValid: state.isDeviceValid,
        lastLocation: state.lastLocation,
        error: state.error,
        startTracking,
        stopTracking,
        sendLocationNow,
        verifyDevice,
    };
}

//HOOK DE ROUTE HISTORY MODAL
export function useRouteHistory({ driverId, enabled = true }: UseRouteHistoryProps) {

    const { data, isLoading, error, refetch } = useQuery({
        queryKey: [QUERY_KEY, "location-history", driverId],
        queryFn: () => getLocationHistory(driverId!, 2, 1000),
        enabled: enabled && !!driverId,
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
    });

    const historyPoints: HistoryPoint[] = data?.map((loc) => {
        let timeStr = '';
        if (loc.reported_at) {
            const date = new Date(loc.reported_at);
            timeStr = date.toLocaleDateString('es-PE', {
                hour: '2-digit',
                minute: '2-digit',
            });
        }

        return {
            lat: loc.latitude ?? 0,
            lng: loc.longitude ?? 0,
            time: timeStr,
            label: loc.reported_at ? new Date(loc.reported_at).toLocaleDateString('es-PE') : undefined,
        };
    }) ?? [];

    const sortedPoints = [...historyPoints].sort((a, b) => {
        if (!a.time && !b.time) return 0;
        if (!a.time) return 1;
        if (!b.time) return -1;
        return a.time.localeCompare(b.time);
    });

    return {
        data: sortedPoints,
        isLoading,
        error: error as Error | null,
        refetch,
    };


}

// ============================================================
//  GESTIÓN DE DISPOSITIVO
// ============================================================

export const useDeviceStatus = () => {
    return useQuery({
        queryKey: [QUERY_KEY, "device-status"],
        queryFn: getDeviceStatus,
        refetchOnWindowFocus: false,
        refetchInterval: 30000, // Refrescar cada 30 segundos
    });
};


export const useRegisterDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ serial }: { serial: string }) => registerDevice(serial),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "device-status"] });
            successToast("Dispositivo registrado correctamente");
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || "Error al registrar dispositivo");
        },
    });
};

export const useUnregisterDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => unregisterDevice(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "device-status"] });
            successToast("Dispositivo desactivado correctamente");
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || "Error al desactivar dispositivo");
        },
    });
};

export const useValidateSerial = () => {
    return useMutation({
        mutationFn: ({ serial }: { serial: string }) => validateSerial(serial),
    });
};

export const useGetEquipmentBySerial = () => {
    return useMutation({
        mutationFn: ({ serial }: { serial: string }) => getEquipmentBySerial(serial),
    });
};

// ============================================================
//  HOOK PARA OBTENER EL SERIAL REGISTRADO
// ============================================================

export function useRegisteredDevice() {
    const { data: deviceStatus, isLoading, refetch } = useQuery({
        queryKey: ["registered-device"],
        queryFn: getDeviceStatus,
        refetchOnWindowFocus: false,
        refetchInterval: 30000, // Refrescar cada 30 segundos
    });

    return {
        deviceId: deviceStatus?.is_active ? deviceStatus.serial : null,
        isActive: deviceStatus?.is_active ?? false,
        equipmentName: deviceStatus?.equipment_name ?? null,
        isLoading,
        refetch,
    };
}

// ============================================================
//  HOOK PARA ADMIN MONITOREO
// ============================================================


export const useAdminAssignDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ driverId, serial }: { driverId: number; serial: string }) =>
            adminAssignDevice(driverId, serial),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "drivers"] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "location", variables.driverId] });
            successToast("Dispositivo asignado correctamente");
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || "Error al asignar dispositivo");
        },
    });
};

export const useAdminRemoveDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ driverId }: { driverId: number }) => adminRemoveDevice(driverId),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "drivers"] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "location", variables.driverId] });
            successToast("Dispositivo removido correctamente");
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || "Error al remover dispositivo");
        },
    });
};

export const useAdminValidateSerial = () => {
    return useMutation({
        mutationFn: ({ serial }: { serial: string }) => adminValidateSerial(serial),
    });
};


export const useAutoActivateDevice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => autoActivateDevice(),
        onSuccess: (data) => {
            if (data.success) {
                queryClient.invalidateQueries({ queryKey: [QUERY_KEY, "device-status"] });
                successToast(data.message || "Dispositivo activado correctamente");
            } else {
                errorToast(data.message || "Error al activar dispositivo");
            }
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || "Error al activar dispositivo");
        },
    });
};