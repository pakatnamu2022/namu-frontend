"use client";

import { useCallback, useEffect, useState } from "react";
import { requestLocationPermission } from "@/shared/lib/device";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useRegisteredDevice, useLocationTracker } from "./lib/monitoreo.hooks";

const TRACKING_INTERVAL_MINUTES = 2;

export function LocationTracker() {
    const { isAuthenticated, user } = useAuthStore();
    const [hasPermission, setHasPermission] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true);
    const [initialized, setInitialized] = useState(false);
    const [shouldTrack, setShouldTrack] = useState(false);

    const isConductor = user?.position?.toUpperCase() === "CONDUCTOR DE TRACTO CAMION";

    const { deviceId, isActive, refetch } = useRegisteredDevice();

    // Obtener el tracker original
    const originalTracker = useLocationTracker({
        deviceId: deviceId || "",
        enabled: shouldTrack,
        intervalMinutes: TRACKING_INTERVAL_MINUTES,
    });

    // Función para guardar ubicación en Service Worker (offline)
    const saveLocationToSW = useCallback((locationData: any) => {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            navigator.serviceWorker.controller.postMessage({
                type: 'SAVE_LOCATION',
                payload: {
                    data: locationData,
                    timestamp: Date.now()
                }
            });
            return true;
        }
        return false;
    }, []);

    // Función para obtener ubicación actual y guardar offline
    const getAndSaveLocationOffline = useCallback(async () => {
        if (!deviceId) return false;

        return new Promise((resolve) => {
            if (!navigator.geolocation) {
                console.warn('Geolocalización no soportada');
                resolve(false);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    // Obtener batería
                    let batteryLevel: number | undefined;
                    if ('getBattery' in navigator) {
                        try {
                            const battery = await (navigator as any).getBattery();
                            batteryLevel = battery.level * 100;
                        } catch {
                            batteryLevel = undefined;
                        }
                    }

                    const locationData = {
                        device_id: deviceId,
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        speed: position.coords.speed ?? undefined,
                        battery_level: batteryLevel,
                        timestamp: new Date().toISOString(),
                    };

                    const saved = saveLocationToSW(locationData);
                    resolve(saved);
                },
                (error) => {
                    console.error('Error obteniendo ubicación offline:', error);
                    resolve(false);
                },
                { enableHighAccuracy: true, timeout: 10000 }
            );
        });
    }, [deviceId, saveLocationToSW]);

    // Wrapper del envío de ubicación que detecta offline
    const enhancedSendLocationNow = useCallback(async () => {
        // Si hay conexión, usar el método original
        if (navigator.onLine) {
            originalTracker.sendLocationNow();
            return;
        }

        // Sin conexión: guardar en SW
        await getAndSaveLocationOffline();
    }, [originalTracker, getAndSaveLocationOffline]);

    // Solicitar permisos solo si está autenticado y es conductor
    useEffect(() => {
        if (!isAuthenticated || !isConductor || !isActive || !deviceId) return;

        const init = async () => {
            const permitted = await requestLocationPermission();
            setHasPermission(permitted);
            setInitialized(true);

            if (!permitted) {
                console.warn("Permiso de ubicación denegado. El tracking no se activará.");
                setIsEnabled(false);
            }
        };

        init();
    }, [isAuthenticated, isConductor, isActive, deviceId]);

    // Refrescar estado del dispositivo solo si está autenticado y es conductor
    useEffect(() => {
        if (!isAuthenticated || !isConductor) return;

        const interval = setInterval(() => {
            refetch();
        }, 60000);

        return () => clearInterval(interval);
    }, [refetch, isAuthenticated, isConductor]);

    // Determinar si debe trackear
    useEffect(() => {
        if (!isAuthenticated || !isConductor) {
            setShouldTrack(false);
            return;
        }

        const canTrack = isActive && !!deviceId && isEnabled && hasPermission && initialized;
        setShouldTrack(canTrack);
    }, [isAuthenticated, isConductor, isEnabled, hasPermission, initialized, isActive, deviceId]);



    const handleVisibilityChange = useCallback(() => {
        if (!document.hidden && originalTracker.isTracking) {
            enhancedSendLocationNow();
        }
    }, [originalTracker.isTracking, enhancedSendLocationNow]);

    useEffect(() => {
        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [handleVisibilityChange]);

    // Componente invisible
    return null;
}