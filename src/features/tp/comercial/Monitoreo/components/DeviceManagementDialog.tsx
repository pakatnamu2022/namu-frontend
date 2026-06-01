
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, Loader2, CheckCircle, XCircle } from "lucide-react";
import { DriverResource } from "../lib/monitoreo.interface";
import { useAdminAssignDevice, useAdminRemoveDevice, useAdminValidateSerial } from "../lib/monitoreo.hooks";

interface DeviceManagementDialogProps {
    driver: DriverResource;
    trigger: React.ReactNode;
    onSuccess?: () => void;
}

export function DeviceManagementDialog({ driver, trigger, onSuccess }: DeviceManagementDialogProps) {
    const [open, setOpen] = useState(false);
    const [serial, setSerial] = useState("");
    const [serialError, setSerialError] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [validatedEquipment, setValidatedEquipment] = useState<{ name: string; serial: string } | null>(null);

    const { mutateAsync: validateSerial } = useAdminValidateSerial();
    const { mutateAsync: assignDevice, isPending: isAssigning } = useAdminAssignDevice();
    const { mutateAsync: removeDevice, isPending: isRemoving } = useAdminRemoveDevice();

    const hasDevice = !!driver.device_id;

    const handleValidateSerial = async () => {
        if (!serial.trim()) {
            setSerialError("Ingrese el número de serie del dispositivo");
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

    const handleAssign = async () => {
        if (!validatedEquipment) {
            setSerialError("Primero valide el dispositivo");
            return;
        }

        await assignDevice({ driverId: driver.id, serial }, {
            onSuccess: () => {
                setOpen(false);
                setSerial("");
                setSerialError("");
                setValidatedEquipment(null);
                onSuccess?.();
            },
        });
    };

    const handleRemove = async () => {
        await removeDevice({ driverId: driver.id }, {
            onSuccess: () => {
                setOpen(false);
                onSuccess?.();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={(newOpen) => {
            if (!newOpen) {
                setSerial("");
                setSerialError("");
                setValidatedEquipment(null);
            }
            setOpen(newOpen);
        }}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Smartphone className="h-5 w-5" />
                        Gestionar dispositivo
                    </DialogTitle>
                    <DialogDescription>
                        {driver.name} ({driver.code})
                    </DialogDescription>
                </DialogHeader>

                {hasDevice ? (
                    <div className="space-y-4 py-4">
                        <div className="rounded-lg border p-4 bg-muted/30">
                            <p className="text-sm text-muted-foreground">Dispositivo actual</p>
                            <p className="font-mono font-medium text-foreground">{driver.device_id}</p>
                        </div>
                        <DialogFooter className="flex gap-2 sm:justify-between">
                            <Button
                                variant="destructive"
                                onClick={handleRemove}
                                disabled={isRemoving}
                            >
                                {isRemoving ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <XCircle className="mr-2 h-4 w-4" />
                                )}
                                Desactivar dispositivo
                            </Button>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                        </DialogFooter>
                    </div>
                ) : (
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="admin-serial">Número de serie del dispositivo</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="admin-serial"
                                    placeholder="Ej: ABC123XYZ789"
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
                                    <p className="text-xs text-green-600">Serie: {validatedEquipment.serial}</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setOpen(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleAssign}
                                disabled={isAssigning || !validatedEquipment}
                            >
                                {isAssigning ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Asignando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        Asignar dispositivo
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}