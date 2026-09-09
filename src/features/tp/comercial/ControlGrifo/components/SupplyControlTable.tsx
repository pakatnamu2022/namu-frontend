"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Truck,
    User,
    Fuel,
    Camera,
    MapPin,
    Calendar,
    ChevronRight,
    Plus,
    House
} from "lucide-react";
import { SupplyControlResource, SupplyControlTableMobileProps } from "../lib/supplyControl.interface";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { SupplyControlDetailModal } from "./SupplyControlDetailModal";
import { Skeleton } from "@/components/ui/skeleton";


export function SupplyControlTableMobile({
    data,
    isLoading,
    onAdd,
    permissions,
}: SupplyControlTableMobileProps) {
    if (isLoading) {
        return (
            <div className="space-y-3 p-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                        <CardContent className="p-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-16" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton className="h-4 w-4 rounded-full" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                            <div className="flex justify-between">
                                <Skeleton className="h-8 w-16" />
                                <Skeleton className="h-8 w-16" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <Fuel className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No hay abastecimientos</h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Registra tu primer abastecimiento
                </p>
                {permissions.canCreate && onAdd && (
                    <Button onClick={onAdd} className="mt-4" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo Abastecimiento
                    </Button>
                )}
            </div>
        );
    }

    return (
        <div className="space-y-3 p-4 pb-20">
            {data.map((record) => (
                <SupplyCardMobile
                    key={record.id}
                    record={record}
                    permissions={permissions}
                />
            ))}
        </div>
    );
}


function SupplyCardMobile({
    record,
    permissions,
}: {
    record: SupplyControlResource;
    permissions: SupplyControlTableMobileProps["permissions"];
}) {
    const [open, setOpen] = useState(false);

    const formatDate = (date: string | null) => {
        if (!date) return "-";
        try {
            return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: es });
        } catch {
            return date;
        }
    };

    return (
        <>
            <Card
                className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                onClick={() => setOpen(true)}
            >
                <CardContent className="p-4 space-y-3">
                    {/* Header: Placa y Estado */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Truck className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono font-bold text-base">
                                {record.vehicle?.placa || "N/A"}
                            </span>
                        </div>
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs py-0.5 px-2",
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

                    {/* Conductor */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-3.5 w-3.5" />
                        <span>{record.driver?.nombre_completo || "N/A"}</span>
                    </div>

                    {/* Grifo */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        <span className="truncate">{record.supplier?.name || "N/A"}</span>
                    </div>

                    {/* Métricas: Galones y Kilometraje */}
                    <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-4">
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Galones</p>
                                <p className="font-bold text-blue-600 text-lg">
                                    {record.gallons?.toFixed(3) || "0.000"}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-muted-foreground uppercase">Km</p>
                                <p className="font-semibold text-base">
                                    {record.mileage ?? "0"}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {record.photo_id && (
                                <Camera className="h-4 w-4 text-green-600" />
                            )}
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        </div>
                    </div>

                    {/* Fecha */}
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(record.recorded_at)}</span>
                    </div>
                </CardContent>
            </Card>

            {/* Modal de detalle */}
            <SupplyControlDetailModal
                record={record}
                permissions={permissions}
                trigger={<></>}
                open={open}
                onOpenChange={setOpen}
            />
        </>
    );
}