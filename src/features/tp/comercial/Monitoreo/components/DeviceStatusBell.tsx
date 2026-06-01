"use client"

import { Smartphone, Loader2, CheckCircle, XCircle, Battery, Signal, Locate } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDeviceStatus, useLocationByDriver, useAutoActivateDevice } from "../lib/monitoreo.hooks";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAuthStore } from "@/features/auth/lib/auth.store";
import { useState } from "react";

export function DeviceStatusBell() {
    const { user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const driverId = user?.partner_id;

    const { data: deviceStatus, refetch: refetchStatus, isLoading: isLoadingStatus } = useDeviceStatus();
    const { mutate: autoActivate, isPending: isActivating } = useAutoActivateDevice();

    const isDeviceActive = deviceStatus?.is_active ?? false;
    const deviceSerial = deviceStatus?.serial ?? null;
    const deviceName = deviceStatus?.equipment_name ?? null;

    const { data: lastLocation, isLoading: isLoadingLocation } = useLocationByDriver(
        isDeviceActive ? driverId : undefined
    );

    const batteryLevel = lastLocation?.battery_level;
    const timeAgo = lastLocation?.time_ago;
    const hasRecentLocation = lastLocation && timeAgo && !timeAgo.includes("Nunca");

    const handleAutoActivate = () => {
        autoActivate(undefined, {
            onSuccess: (data) => {
                if (data.success) {
                    setDialogOpen(false);
                    refetchStatus();
                    setOpen(false);
                }
            },
        });
    };

    const getStatusIcon = () => {
        if (isLoadingStatus) {
            return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
        }
        if (isDeviceActive) {
            return <CheckCircle className="w-4 h-4 text-green-500" />;
        }
        return <XCircle className="w-4 h-4 text-red-500" />;
    };

    const getStatusText = () => {
        if (isLoadingStatus) return "Cargando...";
        if (isDeviceActive) return "Dispositivo activo";
        return "Dispositivo inactivo";
    };

    const getStatusColor = () => {
        if (isLoadingStatus) return "bg-gray-100 dark:bg-gray-800";
        if (isDeviceActive) return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800";
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800";
    };

    const getSignalStatus = () => {
        if (!isDeviceActive) return "No conectado";
        if (!hasRecentLocation) return "Sin datos recientes";
        if (timeAgo?.includes("minutos") && parseInt(timeAgo) < 5) return "Excelente";
        if (timeAgo?.includes("minutos") && parseInt(timeAgo) < 30) return "Regular";
        return "Intermitente";
    }

    const getSignalColor = () => {
        const status = getSignalStatus();
        if (status === "Excelente") return "text-green-500";
        if (status === "Regular") return "text-yellow-500";
        return "text-red-500";
    }

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        className="relative p-2 rounded-md hover:bg-muted transition-colors text-primary dark:text-primary-foreground"
                        aria-label="Estado del dispositivo"
                    >
                        <Smartphone className="w-4 h-4" />
                        {!isLoadingStatus && !isDeviceActive && (
                            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[10px] h-[10px] rounded-full bg-red-500" />
                        )}
                    </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-80 p-0" sideOffset={8}>
                    <div className={`flex items-center gap-3 px-3 py-3 ${getStatusColor()}`}>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white dark:bg-gray-800 shadow-sm">
                            {getStatusIcon()}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-foreground">{getStatusText()}</p>
                            {isDeviceActive && deviceName && (
                                <p className="text-xs text-muted-foreground">{deviceName}</p>
                            )}
                            {isDeviceActive && deviceSerial && (
                                <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                    IMEI: {deviceSerial.slice(0, 8)}...{deviceSerial.slice(-4)}
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="p-3 space-y-3">
                        {/* Estado de batería */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Battery className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Batería del dispositivo:</span>
                            </div>
                            <span className="text-xs font-medium text-foreground">
                                {isLoadingLocation ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : batteryLevel !== null && batteryLevel !== undefined ? (
                                    `${Math.round(batteryLevel)}%`
                                ) : (
                                    "No disponible"
                                )}
                            </span>
                        </div>

                        {/* Ultima actualizacion */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Signal className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground"> Última actualización:</span>
                            </div>
                            <span className={`text-xs font-medium ${getSignalColor()}`}>
                                {lastLocation?.reported_at ? (
                                    (() => {
                                        const diffMinutes = Math.floor((Date.now() - new Date(lastLocation.reported_at).getTime()) / 60000);
                                        if (diffMinutes < 1) return "Hace unos segundos";
                                        if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes !== 1 ? 's' : ''}`;
                                        const diffHours = Math.floor(diffMinutes / 60);
                                        if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
                                        const diffDays = Math.floor(diffHours / 24);
                                        return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
                                    })()
                                ) : "Sin datos"}
                            </span>
                        </div>

                        {/* Precision GPS */}
                        {lastLocation?.accuracy && (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Locate className="h-3.5 w-3.5 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">Precisión GPS</span>
                                </div>
                                <span className="text-xs font-medium text-foreground">
                                    {Math.round(lastLocation.accuracy)} metros
                                </span>
                            </div>
                        )}

                        <Separator className="my-2" />

                        {/* Acciones */}
                        <div className="space-y-2">
                            {!isDeviceActive && (
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="w-full gap-2"
                                    onClick={() => {
                                        setDialogOpen(true);
                                        setOpen(false);
                                    }}
                                >
                                    <Smartphone className="h-3.5 w-3.5" />
                                    Activar dispositivo
                                </Button>
                            )}
                        </div>

                        <p className="text-[10px] text-muted-foreground text-center">
                            El dispositivo se usará para el monitoreo de ubicación en tiempo real
                        </p>
                    </div>
                </PopoverContent>
            </Popover>

            {/* Diálogo de activación automática (sin input de IMEI) */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5" />
                            Activar dispositivo
                        </DialogTitle>
                        <DialogDescription>
                            El sistema buscará automáticamente el dispositivo que tiene asignado en el sistema TICS.
                            {deviceSerial && (
                                <p className="mt-2 text-sm">
                                    Dispositivo actual: <span className="font-mono">{deviceSerial}</span>
                                    {deviceName && <span className="text-muted-foreground"> ({deviceName})</span>}
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p className="text-sm text-muted-foreground">
                            Al hacer clic en "Activar", el sistema verificará si tiene un dispositivo asignado
                            y lo activará automáticamente para el monitoreo de ubicación.
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleAutoActivate} disabled={isActivating}>
                            {isActivating ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Activando...
                                </>
                            ) : (
                                "Activar dispositivo"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}