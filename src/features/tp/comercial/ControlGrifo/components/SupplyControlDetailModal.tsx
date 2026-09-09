"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Truck,
    User,
    Building2,
    Camera,
    Pencil,
    Trash2,
    MapPin,
    X,
    ChevronLeft,
    House,
    Loader2,
    Download,
    Printer,
    Fuel,
    Gauge,
    Calendar,
} from "lucide-react";
import { SupplyControlResource } from "../lib/supplyControl.interface";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription,
} from "@/components/ui/drawer";
import { openPrintWindow } from "../lib/supplyTicket.helpers";
import { useDownloadTicketPhoto } from "../lib/supplyControl.hooks";
import { toast } from "sonner";

interface SupplyControlDetailModalProps {
    record: SupplyControlResource;
    trigger?: React.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    onStatusChange?: (recordId: number, newStatus: 'active' | 'inactive') => void;
    permissions: {
        canUpdate: boolean;
        canDelete: boolean;
        canExport: boolean;
    };
}

export function SupplyControlDetailModal({
    record,
    trigger,
    open: externalOpen,
    onOpenChange,
    permissions,
}: SupplyControlDetailModalProps) {
    const [internalOpen, setInternalOpen] = useState(false);
    const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
    const setIsOpen = onOpenChange || setInternalOpen;
    const { mutate: downloadPhoto, isPending: isDownloading } = useDownloadTicketPhoto();

    const formatDate = (date: string | null) => {
        if (!date) return "-";
        try {
            return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
        } catch {
            return date;
        }
    };

    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    const handlePrintTicket = () => {
        openPrintWindow(record);
    };

    const handleDownloadTicketPhoto = () => {
        if (!record.photo?.id) {
            toast.error("No hay foto del ticket disponible para descargar");
            return;
        }

        downloadPhoto(
            {
                photoId: record.photo.id,
                fileName: record.photo.file_name || `ticket_${record.id}_${new Date().toISOString().split('T')[0]}.jpg`,
            },
            {
                onSuccess: () => {
                    toast.success("Descargando foto del ticket...");
                },
                onError: (error) => {
                    toast.error(error.message || "Error al descargar la foto");
                },
            }
        );
    };

    return (
        <>
            {trigger && (
                <span onClick={handleOpen} className="cursor-pointer inline-block">
                    {trigger}
                </span>
            )}

            <Drawer open={isOpen} onOpenChange={setIsOpen}>
                <DrawerContent className="max-h-[95vh] px-4 pb-6">
                    <DrawerHeader className="px-0 pt-4 pb-2">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 -ml-2"
                                    onClick={handleClose}
                                >
                                    <ChevronLeft className="h-5 w-5" />
                                </Button>
                                <DrawerTitle className="text-lg">
                                    #{record.id} • {record.vehicle?.placa || "Sin placa"}
                                </DrawerTitle>
                            </div>
                            <Badge
                                variant="outline"
                                className={cn(
                                    "text-xs",
                                    record.is_base
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200"
                                )}
                            >
                                {record.is_base ? (
                                    <span className="flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400">
                                        <House className="h-4 w-4 text-blue-500" />
                                        Base
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                                        <MapPin className="h-4 w-4 text-amber-500" />
                                        Fuera
                                    </span>
                                )}
                            </Badge>
                        </div>
                        <DrawerDescription className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(record.recorded_at)}
                        </DrawerDescription>
                    </DrawerHeader>

                    <div className="space-y-4 overflow-auto pb-20">

                        {/* --- SECCIÓN 1: INFORMACIÓN DEL VEHÍCULO --- */}
                        <section className="bg-muted/20 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Truck className="h-4 w-4" />
                                Vehículo
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <p className="text-xs text-muted-foreground">Placa</p>
                                    <p className="font-mono font-semibold">
                                        {record.vehicle?.placa || "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Modelo</p>
                                    <p>{record.vehicle?.modelo || "N/A"}</p>
                                </div>
                            </div>
                        </section>

                        {/* --- SECCIÓN 2: CONDUCTOR --- */}
                        <section className="bg-muted/20 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <User className="h-4 w-4" />
                                Conductor
                            </div>
                            <div>
                                <p className="font-medium">{record.driver?.nombre_completo || "N/A"}</p>
                                <p className="text-xs text-muted-foreground">
                                    Documento: {record.driver?.vat || "N/A"}
                                </p>
                            </div>
                        </section>

                        {/* --- SECCIÓN 3: GRIFO --- */}
                        <section className="bg-muted/20 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                <Building2 className="h-4 w-4" />
                                Grifo
                            </div>
                            <div>
                                <p className="font-medium">{record.supplier?.name || "N/A"}</p>
                                {record.supplier?.address && (
                                    <p className="text-xs text-muted-foreground">
                                        {record.supplier.address}
                                    </p>
                                )}
                            </div>
                        </section>

                        {/* --- SECCIÓN 4: MÉTRICAS (Kilometraje y Galones) --- */}
                        <section className="grid grid-cols-2 gap-3">
                            <div className="bg-primary/5 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                                    <Gauge className="h-3 w-3" />
                                    Kilometraje
                                </div>
                                <p className="text-2xl font-bold text-primary">
                                    {record.mileage ?? "-"}
                                </p>
                                <p className="text-[10px] text-muted-foreground">km</p>
                            </div>
                            <div className="bg-blue-50 rounded-xl p-4 text-center">
                                <div className="flex items-center justify-center gap-1 text-xs text-blue-600">
                                    <Fuel className="h-3 w-3" />
                                    Galones
                                </div>
                                <p className="text-2xl font-bold text-blue-700">
                                    {record.gallons?.toFixed(3) || "-"}
                                </p>
                                <p className="text-[10px] text-blue-500">gal</p>
                            </div>
                        </section>

                        {/* --- SECCIÓN 5: ACCIONES DEL TICKET --- */}
                        <section className="space-y-3">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Printer className="h-4 w-4" />
                                Acciones del Ticket
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Imprimir Ticket */}
                                <Button
                                    onClick={handlePrintTicket}
                                    variant="outline"
                                    className="gap-2 h-11 border-2 hover:bg-primary/5 hover:border-primary/50 transition-all"
                                >
                                    <Printer className="h-4 w-4 text-primary" />
                                    <span className="font-medium">Imprimir Ticket</span>
                                </Button>

                                {/* Descargar Foto */}
                                <Button
                                    onClick={handleDownloadTicketPhoto}
                                    disabled={isDownloading || !record.photo?.id}
                                    variant="outline"
                                    className="gap-2 h-11 border-2 hover:bg-blue-50 hover:border-blue-500/50 transition-all disabled:opacity-50"
                                >
                                    {isDownloading ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                                    ) : (
                                        <Download className="h-4 w-4 text-blue-600" />
                                    )}
                                    <span className="font-medium">
                                        {isDownloading ? "Descargando..." : "Descargar Foto"}
                                    </span>
                                </Button>
                            </div>
                        </section>

                        {/* --- SECCIÓN 6: FOTO DEL TICKET --- */}
                        <section className="space-y-2">
                            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Camera className="h-4 w-4" />
                                Foto del Ticket
                            </h4>

                            {record.photo ? (
                                <div className="bg-muted/20 rounded-xl overflow-hidden border border-muted">
                                    {/* Header de la foto */}
                                    <div className="flex items-center justify-between p-3 text-sm font-medium text-muted-foreground border-b bg-muted/10">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Camera className="h-4 w-4 shrink-0" />
                                            <span className="truncate">{record.photo.file_name}</span>
                                            {record.photo.file_size && (
                                                <Badge variant="outline" className="text-[10px] shrink-0">
                                                    {(record.photo.file_size / 1024).toFixed(1)} KB
                                                </Badge>
                                            )}
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="gap-1.5 h-7 text-xs hover:bg-blue-50 hover:text-blue-600 shrink-0"
                                            onClick={handleDownloadTicketPhoto}
                                            disabled={isDownloading}
                                        >
                                            {isDownloading ? (
                                                <Loader2 className="h-3 w-3 animate-spin" />
                                            ) : (
                                                <Download className="h-3 w-3" />
                                            )}
                                            <span>Descargar</span>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-muted/10 rounded-xl border border-dashed border-muted p-8 text-center">
                                    <Camera className="h-10 w-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                                    <p className="text-sm text-muted-foreground">No hay foto del ticket disponible</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">
                                        El ticket aún no ha sido subido
                                    </p>
                                </div>
                            )}
                        </section>
                    </div>

                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-2">
                        {permissions.canUpdate && (
                            <Button variant="outline" className="flex-1 gap-2" size="sm">
                                <Pencil className="h-4 w-4" />
                                Editar
                            </Button>
                        )}
                        {permissions.canDelete && (
                            <Button variant="destructive" className="flex-1 gap-2" size="sm">
                                <Trash2 className="h-4 w-4" />
                                Anular
                            </Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={handleClose} className="shrink-0">
                            <X className="h-5 w-5" />
                        </Button>
                    </div>
                </DrawerContent>
            </Drawer>
        </>
    );
}