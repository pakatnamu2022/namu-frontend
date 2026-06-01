"use client";


import { AlertCircle } from "lucide-react";
import { useRegisteredDevice } from "../lib/monitoreo.hooks";
import { useAuthStore } from "@/features/auth/lib/auth.store";

export function DeviceInactiveAlert() {
    const { user, isAuthenticated } = useAuthStore();
    const { isActive, isLoading } = useRegisteredDevice();

    const isConductor = user?.position?.toUpperCase() === "CONDUCTOR DE TRACTO CAMION";

    if (!isAuthenticated || !isConductor) return null;
    if (isLoading) return null;
    if (isActive) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
            <div className="flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3 shadow-lg dark:border-yellow-800 dark:bg-yellow-900/30">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div className="text-sm">
                    <p className="font-medium text-yellow-800 dark:text-yellow-400">
                        Dispositivo no activado
                    </p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-500">
                        Active su dispositivo desde el menú de perfil para comenzar el monitoreo
                    </p>
                </div>
            </div>
        </div>
    );
}