"use client"

import { useState } from "react";
import { Smartphone, Loader2, CheckCircle, XCircle, Battery, Signal, Locate } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useDeviceStatus, useLocationByDriver, useRegisterDevice, useValidateSerial } from "../lib/monitoreo.hooks";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/lib/auth.store";


export function DeviceStatusBell() {
    const { user } = useAuthStore();
    const [open, setOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [serial, setSerial] = useState("");
    const [serialError, setSerialError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [validatedEquipment, setValidatedEquipment] = useState<{ name: string; serial: string } | null>(null);
    const driverId = user?.partner_id;


    const { data: deviceStatus, refetch: refetchStatus, isLoading: isLoadingStatus } = useDeviceStatus();
    const isDeviceActive = deviceStatus?.is_active ?? false;
    const deviceSerial = deviceStatus?.serial ?? null;
    const deviceName = deviceStatus?.equipment_name ?? null;

    const { data: lastLocation, isLoading: isLoadingLocation, refetch: _refetchLocation } = useLocationByDriver(
        isDeviceActive ? driverId : undefined
    );
    const { mutate: registerDevice, isPending: isRegistering } = useRegisterDevice();
    const { mutateAsync: validateSerial } = useValidateSerial();



    const batteryLevel = lastLocation?.battery_level;
    const timeAgo = lastLocation?.time_ago;
    const hasRecentLocation = lastLocation && timeAgo && !timeAgo.includes("Nunca");


    const handleValidateSerial = async () => {
        if (!serial.trim()) {
            setSerialError("Ingrese el número de IMEI del dispositivo");
            return;
        }

        setIsValidating(true);
        setSerialError("");
        setValidatedEquipment(null);

        try {
            const result = await validateSerial({ serial });
            if (result.valid && result.data) {
                setValidatedEquipment({
                    name: result.data.equipment_name,
                    serial: result.data.serial,
                });
                setSerialError("");
            } else {
                setSerialError(result.message || "Dispositivo no válido");
                setValidatedEquipment(null);
            }
        } catch (error: any) {
            setSerialError(error?.message || "Error al validar dispositivo");
            setValidatedEquipment(null);
        } finally {
            setIsValidating(false);
        }
    };

    const handleRegister = () => {
        if (!validatedEquipment) {
            setSerialError("Primero valide el dispositivo");
            return;
        }

        registerDevice({ serial }, {
            onSuccess: () => {
                setDialogOpen(false);
                setSerial("");
                setSerialError("");
                setValidatedEquipment(null);
                refetchStatus();
                setOpen(false);
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

                        {/* Velocidad actual */}
                        {/* <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-xs text-muted-foreground">Velocidad actual:</span>
                            </div>
                            <span className="text-xs font-medium text-foreground">
                                {lastLocation?.speed !== null && lastLocation?.speed !== undefined ? (
                                    `${lastLocation.speed} km/h`
                                ) : (
                                    "No disponible"
                                )}
                            </span>
                        </div> */}

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

                        {/*Precision GPS */}
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

            {/* Diálogo de gestión de dispositivo */}
            <Dialog open={dialogOpen} onOpenChange={(newOpen) => {
                if (!newOpen) {
                    setSerial("");
                    setSerialError("");
                    setValidatedEquipment(null);
                }
                setDialogOpen(newOpen);
            }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Smartphone className="h-5 w-5" />
                            {isDeviceActive ? "Cambiar dispositivo" : "Activar dispositivo"}
                        </DialogTitle>
                        <DialogDescription>
                            Ingrese el número de IMEI del dispositivo móvil que le fue asignado.
                            {isDeviceActive && deviceSerial && (
                                <p className="mt-2 text-sm">
                                    Dispositivo actual: <span className="font-mono">{deviceSerial}</span>
                                    {deviceName && <span className="text-muted-foreground"> ({deviceName})</span>}
                                </p>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="device-serial">Número de IMEI del dispositivo</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="device-serial"
                                    placeholder="Ej: 123456789012345"
                                    value={serial}
                                    onChange={(e) => {
                                        setSerial(e.target.value.toUpperCase());
                                        setSerialError("");
                                        setValidatedEquipment(null);
                                    }}
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleValidateSerial}
                                    disabled={isValidating || !serial.trim()}
                                >
                                    {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Validar"}
                                </Button>
                            </div>
                            {serialError && (
                                <p className="text-sm text-red-500">{serialError}</p>
                            )}
                            {validatedEquipment && (
                                <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200">
                                    <p className="text-sm text-green-700 dark:text-green-400">
                                        Dispositivo válido: <strong>{validatedEquipment.name}</strong>
                                    </p>
                                    <p className="text-xs text-green-600">IMEI: {validatedEquipment.serial}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleRegister}
                            disabled={isRegistering || !validatedEquipment}
                        >
                            {isRegistering ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                isDeviceActive ? "Cambiar" : "Activar"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );


}