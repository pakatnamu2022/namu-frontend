import { Battery, BatteryWarning, Crosshair, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriverAvatar } from "./DriverAvatar";
import { DriverListCardProps, DriverStatus } from "../lib/monitoreo.interface";



const statusConfig: Record<DriverStatus, { dotClass: string; label: string }> = {
    active: { dotClass: "bg-green-500", label: "Activo" },
    inactive: { dotClass: "bg-yellow-500", label: "Inactivo" },
    disconnected: { dotClass: "bg-red-500", label: "Desconectado" },
    nodata: { dotClass: "bg-gray-400", label: "Sin datos" },
}

function formatCoordinate(coord: number | string | null | undefined): string {
    if (coord == null || coord === undefined) return "";

    const num = typeof coord === "string" ? parseFloat(coord) : coord;
    return isNaN(num) ? "" : num.toFixed(4);
}


export function DriverListCard({ driver, selected, onSelect, onCenter }: DriverListCardProps) {
    const location = driver.last_location;
    const lowBattery = (location?.battery_level ?? 100) < 20;
    const statusInfo = statusConfig[driver.status];


    const lat = location?.latitude ? parseFloat(location.latitude as any) : null;
    const lng = location?.longitude ? parseFloat(location.longitude as any) : null;
    const hasValidLocation = lat !== null && !isNaN(lat) && lng !== null && !isNaN(lng);

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={onSelect}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect();
                }
            }}
            className={`group w-full cursor-pointer rounded-lg border bg-card p-3 text-left transition-all hover:-translate-y-px hover:border-accent/40 hover:shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${selected ? "border-accent ring-2 ring-accent/30" : "border-border"
                }`}
        >
            <div className="flex items-start gap-3">
                <DriverAvatar name={driver.name} />
                <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-foreground">{driver.name}</p>
                        <span className="text-[10px] font-medium text-muted-foreground">{driver.code}</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 text-xs">
                        <span className={`inline-block h-2 w-2 rounded-full ${statusInfo.dotClass}`} />
                        <span className="font-medium text-foreground">{statusInfo.label}</span>
                        <span className="text-muted-foreground">· {location?.time_ago || "Nunca"}</span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        {location?.battery_level != null && (
                            <span className="inline-flex items-center gap-1">
                                {lowBattery ? <BatteryWarning className="h-3.5 w-3.5 text-red-500" /> : <Battery className="h-3.5 w-3.5" />}
                                {location.battery_level}%
                            </span>
                        )}
                        {hasValidLocation && (
                            <span className="inline-flex items-center gap-1 truncate">
                                <MapPin className="h-3.5 w-3.5" /> {formatCoordinate(lat)}, {formatCoordinate(lng)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-3 flex gap-2">
                <Button
                    size="sm"
                    variant="secondary"
                    className="h-7 flex-1 text-xs"
                    disabled={!location?.latitude || !location?.longitude}
                    onClick={(e) => {
                        e.stopPropagation();
                        onCenter();
                    }}
                >
                    <Crosshair className="mr-1 h-3 w-3" /> Centrar
                </Button>
                {/* <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 flex-1 text-xs"
                    onClick={(e) => {
                        e.stopPropagation();
                        onHistory();
                    }}
                >
                    <History className="mr-1 h-3 w-3" /> Historial
                </Button> */}
            </div>
        </div>
    );
}