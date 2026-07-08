import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap, ZoomControl } from "react-leaflet";
import L from "leaflet";
import { Crosshair, History, Maximize2, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DriverStatus, MapEffectsProps, MapViewProps } from "../lib/monitoreo.interface";
import "leaflet/dist/leaflet.css";

//CONSTANTES

const DEFAULT_CENTER: [number, number] = [-12.0464, -77.0428];
const DEFAULT_ZOOM = 12;
const FLY_DURATION = 0.8;
const PULSE_ANIMATION = `
  @keyframes pulse {
    0% { transform: scale(1); opacity: 0.4; }
    70% { transform: scale(1.5); opacity: 0; }
    100% { transform: scale(1.8); opacity: 0; }
  }
`;

const STATUS_COLORS = {
    active: "#22c55e",
    inactive: "#eab308",
    disconnected: "#ef4444",
    nodata: "#9ca3af",
} as const;


const setupLeafleIcons = () => {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });
};

setupLeafleIcons();

function useMapCenter(focusTarget: MapEffectsProps['focusTarget'], drivers: any[], map: L.Map) {
    const lastFocusRef = useRef<number | null>(null);

    const focusOnDriver = useCallback(() => {
        if (!focusTarget || focusTarget.ts === lastFocusRef.current) return;
        lastFocusRef.current = focusTarget.ts;

        const driver = drivers.find((d) => String(d.id) === focusTarget.id);
        if (driver?.last_location?.latitude && driver?.last_location?.longitude) {
            map.flyTo(
                [driver.last_location.latitude, driver.last_location.longitude],
                Math.max(map.getZoom(), 15),
                { duration: FLY_DURATION }
            );
        }
    }, [focusTarget, drivers, map]);

    return { focusOnDriver };
}

//hook para ajustar la vista a todos los conductores
function useFitAllDrivers(selectedId: string | null, drivers: any[], map: L.Map) {
    const fitAllDrivers = useCallback(() => {
        if (selectedId) return;

        const points = drivers
            .filter((d) => d.last_location?.latitude && d.last_location.longitude)
            .map((d) => [d.last_location!.latitude, d.last_location!.longitude] as [number, number]);

        if (points.length === 0) return;

        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds.pad(0.25), { animate: true, maxZoom: 14 });
    }, [drivers.length, selectedId, map]);

    return { fitAllDrivers };
}

const iconCache = new Map<string, L.DivIcon>();
// Función para construir ícono por estado
function buildDriverIcon(status: DriverStatus, selected: boolean = false) {

    const cacheKey = `${status}-${selected}`;

    if (iconCache.has(cacheKey)) {
        return iconCache.get(cacheKey);
    }

    const color = STATUS_COLORS[status] || STATUS_COLORS.nodata;
    const size = selected ? 36 : 32;
    const margin = selected ? -18 : -16;

    const html = `
            <div style="position: relative; width: 40px; height: 40px;">
            ${status === "active" && !selected ? `
                <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: 50px;
                height: 50px;
                margin: -25px 0 0 -25px;
                border-radius: 50%;
                background-color: ${color};
                opacity: 0.4;
                animation: pulse 1.5s infinite;
                "></div>
            ` : ""}
            <div style="
                position: absolute;
                top: 50%;
                left: 50%;
                width: ${size}px;
                height: ${size}px;
                margin: ${margin}px 0 0 ${margin}px;
                background-color: ${color};
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                ${selected ? "box-shadow: 0 0 0 3px rgba(59,130,246,0.5);" : ""}
            ">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13" rx="2" ry="2" fill="white" stroke="currentColor"/>
                <path d="M16 8h4l3 3v4h-2" stroke="currentColor"/>
                <circle cx="6.5" cy="16.5" r="2.5" fill="white" stroke="currentColor"/>
                <circle cx="15.5" cy="16.5" r="2.5" fill="white" stroke="currentColor"/>
                </svg>
            </div>
            </div>
            <style>${PULSE_ANIMATION}</style>
            `;

    const icon = L.divIcon({
        html,
        className: 'driver-pin',
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -18],
    });
    iconCache.set(cacheKey, icon);
    return icon;
}



function MapEffects({ drivers, focusTarget, selectedId }: MapEffectsProps) {
    const map = useMap();
    const { focusOnDriver } = useMapCenter(focusTarget, drivers, map);
    const { fitAllDrivers } = useFitAllDrivers(selectedId, drivers, map);

    useEffect(() => {
        if (focusTarget) {
            focusOnDriver();
        }
        else {
            fitAllDrivers();
        }
    }, [focusTarget, selectedId, drivers.length, focusOnDriver, fitAllDrivers]);

    return null;
}


function MapToolbar() {
    const map = useMap();

    const fitAll = useCallback(() => {
        const points: L.LatLngExpression[] = [];
        map.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                points.push(layer.getLatLng());
            }
        });
        if (points.length) {
            map.fitBounds(L.latLngBounds(points).pad(0.25), { animate: true });
        }
    }, [map]);

    const goToMyLocation = useCallback(() => {
        if (!navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                map.flyTo([pos.coords.latitude, pos.coords.longitude], 15, { duration: FLY_DURATION })
            },
            () => {
                map.flyTo(DEFAULT_CENTER, 13);
            }
        )
    }, [map]);

    const buttons = useMemo(() => [
        { Icon: Crosshair, onClick: goToMyLocation, title: "Mi ubicación" },
        { Icon: Maximize2, onClick: fitAll, title: "Ajustar a conductores" }
    ], [goToMyLocation, fitAll]);

    return (
        <div className="pointer-events-auto absolute bottom-24 right-3 z-[1000] flex flex-col gap-2">
            {buttons.map(({ Icon, onClick, title }) => (
                <Button
                    key={title}
                    size="icon"
                    variant="secondary"
                    className="shadow-md"
                    onClick={onClick}
                    title={title}
                >
                    <Icon className="h-4 w-4" />
                </Button>
            ))}
        </div>
    );
}

const DriverPopup = React.memo(({ driver, onShowHistory }: {
    driver: any;
    onShowHistory: (id: string) => void;
}) => {
    return (
        <div className="space-y-3 p-3 min-w-[220px]">
            <div>
                <div className="text-sm font-semibold">{driver.name}</div>
                <div className="text-xs text-muted-foreground">{driver.code}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Estado</div>
                    <div className="font-medium">{driver.status_text}</div>
                </div>
                <div>
                    <div className="text-[10px] uppercase text-muted-foreground">Última actualización</div>
                    <div className="font-medium">{driver.last_location?.time_ago || "Nunca"}</div>
                </div>
                {driver.last_location?.battery_level && (
                    <div>
                        <div className="text-[10px] uppercase text-muted-foreground">Batería</div>
                        <div className="font-medium">{driver.last_location.battery_level}%</div>
                    </div>
                )}
            </div>
            {driver.last_location?.google_maps_url && (
                <div className="flex gap-2 pt-1">
                    <Button size="sm" variant="outline" asChild className="flex-1">
                        <a href={driver.last_location.google_maps_url} target="_blank" rel="noreferrer">
                            <Navigation className="mr-1 h-3 w-3" /> Ruta
                        </a>
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onShowHistory(String(driver.id))}
                        className="flex-1"
                    >
                        <History className="mr-1 h-3 w-3" /> Historial
                    </Button>
                </div>
            )}
        </div>
    );
});

DriverPopup.displayName = 'DriverPopup';

export function MapView({ drivers, selectedId, onSelect, onShowHistory, focusTarget }: MapViewProps) {
    const placed = useMemo(
        () => drivers.filter((d) => d.last_location?.latitude && d.last_location?.longitude),
        [drivers]
    );
    const mapConfig = useMemo(() => ({
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        className: "h-full w-full",
        style: { height: "100%", minHeight: "400px" },
        scrollWheelZoom: true,
        dragging: true,
        touchZoom: true,
    }), []);
    const handleSelect = useCallback((id: string) => {
        onSelect(id);
    }, [onSelect]);

    const handleShowHistory = useCallback((id: string) => {
        onShowHistory(id);
    }, [onShowHistory]);

    return (
        <div className="relative h-full w-full overflow-hidden rounded-lg border bg-muted">
            <MapContainer {...mapConfig}>
                <TileLayer
                    attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />


                <MapEffects drivers={drivers} focusTarget={focusTarget} selectedId={selectedId} />

                <MapToolbar />

                {placed.map((driver) => (
                    <Marker
                        key={driver.id}
                        position={[driver.last_location!.latitude!, driver.last_location!.longitude!]}
                        icon={buildDriverIcon(driver.status, selectedId === String(driver.id))}
                        eventHandlers={{ click: () => handleSelect(String(driver.id)) }}
                    >
                        <Tooltip direction="top" offset={[0, -16]} opacity={1}>
                            <div className="text-xs">
                                <div className="font-semibold">{driver.name}</div>
                                <div>{driver.last_location?.time_ago || "Nunca"}</div>
                                {driver.last_location?.battery_level && (
                                    <div>🔋 {driver.last_location.battery_level}%</div>
                                )}
                            </div>
                        </Tooltip>
                        <Popup>
                            <DriverPopup driver={driver} onShowHistory={handleShowHistory} />
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}