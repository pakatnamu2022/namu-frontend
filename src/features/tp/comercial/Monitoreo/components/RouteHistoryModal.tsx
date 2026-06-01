import { useMemo, useRef, useCallback } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Polyline, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Share2, Clock, Gauge, Route as RouteIcon, MapPin, Loader2, Calendar, TrendingUp, TrendingDown, Play, Square, Flag } from "lucide-react";
import { HistoryPoint, RouteHistoryModalProps } from "../lib/monitoreo.interface";
import { useRouteHistory } from "../lib/monitoreo.hooks";


function FitBounds({ points }: { points: [number, number][] }) {
    const map = useMap();
    const fitRef = useRef(false);

    useMemo(() => {
        if (fitRef.current || points.length === 0) return;
        fitRef.current = true;
        map.fitBounds(L.latLngBounds(points).pad(0.2));
    }, [points, map]);

    return null;
}

function haversine(a: [number, number], b: [number, number]) {
    const R = 6371;
    const toRad = (v: number) => (v * Math.PI) / 180;
    const dLat = toRad(b[0] - a[0]);
    const dLng = toRad(b[1] - a[1]);
    const s =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(a[0])) * Math.cos(toRad(b[0])) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
}

function formatDur(min: number) {
    if (!min || min <= 0) return "0 min";
    const h = Math.floor(min / 60);
    const m = min % 60;
    if (h > 0 && m > 0) return `${h}h ${m}min`;
    if (h > 0) return `${h}h`;
    return `${m}min`;
}

function formatTimeRange(route: HistoryPoint[]) {
    if (!route?.length) return null;
    const start = route[0]?.time;
    const end = route[route.length - 1]?.time;
    if (!start || !end) return null;
    return { start, end };
}


function useRouteStats(points: [number, number][], route: HistoryPoint[]) {
    return useMemo(() => {
        let dist = 0;
        for (let i = 1; i < points.length; i++) {
            dist += haversine(points[i - 1], points[i]);
        }

        const stops = route.filter((p) => p.type === "stop").length;
        const start = route[0]?.time;
        const end = route[route.length - 1]?.time;

        let durMin = 0;
        if (start && end) {
            const [sh, sm] = start.split(":").map(Number);
            const [eh, em] = end.split(":").map(Number);
            durMin = Math.max(0, (eh * 60 + em) - (sh * 60 + sm));
        }

        const avg = durMin > 0 ? Math.round((dist / (durMin / 60)) * 10) / 10 : 0;
        const avgSpeedPerStop = stops > 0 ? Math.round((dist / stops) * 10) / 10 : dist;
        const efficiency = avg > 0 && avg < 60 ? "Óptimo" : avg >= 60 ? "Alto consumo" : "Baja velocidad";

        return {
            dist: Math.round(dist * 10) / 10,
            durMin,
            avg,
            stops,
            avgSpeedPerStop,
            efficiency,
        };
    }, [points, route]);
}


function StatCard({ icon, label, value, trend }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    trend?: 'up' | 'down';
}) {
    return (
        <div className="group rounded-md border bg-card p-4 transition-all hover:shadow-md hover:border-primary/20 w-full max-w-md mx-auto">
            <div className="flex flex-col items-center text-center gap-2">
                <span className="shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
                    {icon}
                </span>
                <div className="flex flex-col items-center gap-1">
                    <span className="text-xs text-muted-foreground">{label}</span>
                    <div className="flex items-center gap-1.5">
                        {trend && (
                            <span className={`${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                                {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            </span>
                        )}
                        <span className="text-lg font-bold text-foreground" title={value}>
                            {value}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}


function RouteDateHeader({ route }: { route: HistoryPoint[] }) {
    const timeRange = formatTimeRange(route);
    if (!timeRange) return null;

    return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-1.5 w-fit">
            <Calendar className="h-3.5 w-3.5" />
            <span>Ruta: {timeRange.start} - {timeRange.end}</span>
        </div>
    );
}

function InterestPointsList({ route }: { route: HistoryPoint[] }) {
    const points = route?.filter(p => p.label) ?? [];

    if (points.length === 0) return null;

    const getPointColor = (type?: string) => {
        switch (type) {
            case 'start': return 'border-green-500/50 bg-green-500/10';
            case 'end': return 'border-red-500/50 bg-red-500/10';
            case 'stop': return 'border-yellow-500/50 bg-yellow-500/10';
            default: return 'border-blue-500/50 bg-blue-500/10';
        }
    };

    const getPointIcon = (type?: string) => {
        switch (type) {
            case 'start': return <Play className="h-4 w-4 text-green-500 fill-green-500" />;
            case 'end': return <Flag className="h-4 w-4 text-red-500 fill-red-500" />;
            case 'stop': return <Square className="h-4 w-4 text-blue-500" />;
            default: return <Square className="h-4 w-4 text-gray-400" />;
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-foreground">Puntos de interés</h3>
                <span className="text-xs text-muted-foreground">{points.length} puntos</span>
            </div>
            <div className="space-y-2 max-h-[260px] overflow-auto pr-1 custom-scrollbar">
                {points.map((p, i) => (
                    <div
                        key={i}
                        className={`flex items-center justify-between gap-3 rounded-md border p-2.5 text-xs transition-all hover:shadow-sm ${getPointColor(p.type)}`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-base">{getPointIcon(p.type)}</span>
                            <span className="font-medium text-foreground">{p.label}</span>
                        </div>
                        <span className="font-mono text-xs text-muted-foreground bg-background/50 px-2 py-0.5 rounded">
                            {p.time}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function EfficiencyBadge({ efficiency }: { efficiency: string }) {
    const getEfficiencyColor = () => {
        switch (efficiency) {
            case 'Óptimo': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'Alto consumo': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            default: return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
        }
    };

    return (
        <div className={`text-xs px-2 py-1 rounded-full font-medium w-fit ${getEfficiencyColor()}`}>
            {efficiency === 'Óptimo' ? '⚡ Eficiencia óptima' : efficiency === 'Alto consumo' ? '⚠️ Alto consumo' : '🐢 Baja velocidad'}
        </div>
    );
}



export function RouteHistoryModal({ driver, open, onOpenChange }: RouteHistoryModalProps) {
    const { data: route, isLoading: loading } = useRouteHistory({
        driverId: driver?.id,
        enabled: open && !!driver
    });

    const points = useMemo<[number, number][]>(() => route?.map((p) => [p.lat, p.lng]) ?? [], [route]);
    const stats = useRouteStats(points, route ?? []);

    const handleExport = useCallback(() => {
        console.log('Exportar ruta', route);
    }, [route]);

    const handleShare = useCallback(() => {
        console.log('Compartir ruta', route);
    }, [route]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] p-0 gap-0 flex flex-col">
                {/* Header fijo */}
                <div className="border-b px-6 py-4 shrink-0">
                    <DialogHeader className="p-0 space-y-2">
                        <DialogTitle className="text-xl">
                            Historial de ruta — {driver?.name ?? "Conductor"}
                        </DialogTitle>
                        <div className="flex items-center justify-between flex-wrap gap-3">
                            <DialogDescription className="text-sm">
                                Últimas ubicaciones registradas
                            </DialogDescription>
                            {route && <RouteDateHeader route={route} />}
                        </div>
                    </DialogHeader>
                </div>

                {/* Contenido con scroll */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {loading ? (
                        <div className="flex h-[400px] items-center justify-center">
                            <div className="text-center space-y-3">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                <p className="text-sm text-muted-foreground">Cargando historial de ruta...</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Mapa */}
                            <div className="h-[350px] overflow-hidden rounded-lg border bg-muted shrink-0">
                                {open && points.length > 0 ? (
                                    <MapContainer center={points[0]} zoom={14} className="h-full w-full" scrollWheelZoom>
                                        <TileLayer
                                            attribution='&copy; OpenStreetMap'
                                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        />
                                        <FitBounds points={points} />
                                        <Polyline
                                            positions={points}
                                            pathOptions={{ color: "hsl(215, 80%, 55%)", weight: 4, opacity: 0.9 }}
                                        />
                                        {route?.map((p, i) => {
                                            const colorMap = {
                                                start: "hsl(145, 63%, 42%)",
                                                end: "hsl(354, 70%, 54%)",
                                                stop: "hsl(45, 100%, 51%)",
                                            };
                                            const color = colorMap[p.type as keyof typeof colorMap] || "hsl(215, 80%, 55%)";

                                            return (
                                                <CircleMarker
                                                    key={i}
                                                    center={[p.lat, p.lng]}
                                                    radius={p.type ? 8 : 5}
                                                    pathOptions={{ color: "white", weight: 2.5, fillColor: color, fillOpacity: 1 }}
                                                >
                                                    {p.label && (
                                                        <Tooltip>
                                                            <div className="text-xs space-y-0.5 p-1">
                                                                <div className="font-semibold">{p.time}</div>
                                                                <div>{p.label}</div>
                                                            </div>
                                                        </Tooltip>
                                                    )}
                                                </CircleMarker>
                                            );
                                        })}
                                    </MapContainer>
                                ) : (
                                    <div className="flex h-full items-center justify-center">
                                        <p className="text-sm text-muted-foreground">No hay puntos de ruta disponibles</p>
                                    </div>
                                )}
                            </div>

                            {/* Estadísticas */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-foreground">Estadísticas</h3>
                                    <EfficiencyBadge efficiency={stats.efficiency} />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <StatCard icon={<RouteIcon className="h-4 w-4" />} label="Distancia total" value={`${stats.dist} km`} />
                                    <StatCard icon={<Clock className="h-4 w-4" />} label="Tiempo total" value={formatDur(stats.durMin)} />
                                    <StatCard
                                        icon={<Gauge className="h-4 w-4" />}
                                        label="Velocidad promedio"
                                        value={`${stats.avg} km/h`}
                                        trend={stats.avg > 50 ? 'up' : stats.avg < 30 ? 'down' : undefined}
                                    />
                                    <StatCard icon={<MapPin className="h-4 w-4" />} label="Paradas realizadas" value={String(stats.stops)} />
                                </div>
                            </div>

                            {/* Puntos de interés */}
                            {route && <InterestPointsList route={route} />}
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t px-6 py-4 shrink-0 flex justify-end gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={loading || !route?.length}
                        className="gap-2"
                    >
                        <Download className="h-4 w-4" />
                        Exportar ruta
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        disabled={loading || !route?.length}
                        className="gap-2"
                    >
                        <Share2 className="h-4 w-4" />
                        Compartir
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

