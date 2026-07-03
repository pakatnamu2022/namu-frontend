import { MapPin, Battery, Gauge, History } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { DriverAvatar } from "./DriverAvatar";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { DriverRowProps } from "../lib/monitoreo.interface";


export function DriverRow({ driver, onViewOnMap, onShowHistory }: DriverRowProps) {
    const { last_location } = driver;

    const coords = last_location?.coordinates || "No disponible";
    const hasLocation = !!last_location?.latitude && !!last_location?.longitude;
    const batteryLevel = last_location?.battery_level;

    return (
        <tr className="border-b border-border transition-colors hover:bg-muted/50">
            {/* Conductor */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                    <DriverAvatar name={driver.name} code={driver.code} />
                    <div>
                        <p className="text-sm font-medium text-foreground">{driver.name}</p>
                        <p className="text-xs text-muted-foreground">{driver.code}</p>
                    </div>
                </div>
            </td>

            {/* Estado */}
            <td className="px-4 py-3">
                <StatusBadge status={driver.status} />
            </td>

            {/* Última Actualización */}
            <td className="px-4 py-3">
                <div className="flex flex-col">
                    <span className="text-sm text-muted-foreground">
                        {last_location?.time_ago || "Nunca"}
                    </span>
                    {batteryLevel !== null && batteryLevel !== undefined && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Battery className="h-3 w-3" />
                            {batteryLevel}%
                        </span>
                    )}
                </div>
            </td>

            {/* Coordenadas */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    <Gauge className="h-3 w-3 text-muted-foreground" />
                    <span className="font-mono text-xs text-muted-foreground">{coords}</span>
                </div>
            </td>

            {/* Acciones */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                    {hasLocation ? (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onViewOnMap?.(driver)}
                                    className="gap-1.5"
                                >
                                    <MapPin className="h-4 w-4 text-accent text-blue-500" />
                                    <span className="text-xs">Ver en mapa</span>
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Abrir en Google Maps</p>
                            </TooltipContent>
                        </Tooltip>
                    ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onShowHistory?.(driver)}
                                className="gap-1.5"
                            >
                                <History className="h-4 w-4 text-purple-500" />
                                <span className="text-xs">Historial</span>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Ver historial de ruta</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
            </td>
        </tr>
    );
}