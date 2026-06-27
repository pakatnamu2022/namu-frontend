export type DriverStatus = 'active' | 'inactive' | 'disconnected' | 'nodata';
export type FilterStatus = DriverStatus | "all";
export type SidebarFilter = "all" | DriverStatus;
export type ViewMode = "list" | "map";

export interface DriverLocation {
    id: number;
    driver_id: number;
    driver_name: string;
    driver_code: string;
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
    speed: number | null;
    battery_level: number | null;
    reported_at: string | null;
    coordinates: string | null;
    google_maps_url: string | null;
    time_ago: string | null;
    status: DriverStatus;
    status_color: string;
}

export interface DriverResource {
    id: number;
    code: string;
    name: string;
    status: DriverStatus;
    status_text: string;
    status_color: string;
    last_location: {
        coordinates: string | null;
        latitude: number | null;
        longitude: number | null;
        reported_at: string | null;
        time_ago: string | null;
        accuracy: number | null;
        battery_level: number | null;
        google_maps_url: string | null;
    } | null;
    device_id: string | null;
    is_active: boolean;
}

export interface DriversStats {
    total_drivers: number;
    active: number;
    inactive: number;
    disconnected: number;
    without_location: number;
    online_percentage: number;
}

export interface DriverLocationConfiguration {
    key: string;
    value: any;
    description: string | null;
}

export interface DriverStatusLog {
    id: number;
    driver_id: number;
    status: DriverStatus;
    status_text: string;
    changed_at: string;
    time_ago: string;
    driver?: {
        id: number;
        name: string;
        code: string;
    };
}

export interface GetDriversProps {
    search?: string;
    status?: DriverStatus | 'all';
    page?: number;
    per_page?: number;
}

export interface GetLocationsProps {
    driver_id?: number;
    from_date?: string;
    to_date?: string;
    page?: number;
    per_page?: number;
}
export interface GetStatusLogsProps {
    driver_id?: number;
    status?: DriverStatus;
    from_date?: string;
    to_date?: string;
    page?: number;
    per_page?: number;
}

export interface FleetToolbarProps {
    search: string;
    setSearch: (value: string) => void;
    status: FilterStatus;
    setStatus: (value: FilterStatus) => void;
    onRefresh: () => void;
    isRefreshing: boolean;
    lastRefresh: Date;
}

export interface MonitoreoOptionsProps {
    search: string;
    setSearch: (value: string) => void;
    status: DriverStatus | 'all';
    setStatus: (value: DriverStatus | 'all') => void;
    onRefresh: () => void;
    onSearchChange: (value: string) => void;
    isRefreshing: boolean;
    lastRefresh: Date;
}
// Props para el modal de ubicación en mapa
export interface LocationModalProps {
    driver: DriverResource;
    trigger: React.ReactNode;
}

// Respuestas de API
export interface DriversResponse {
    current_page: number;
    data: DriverResource[];
    first_page_url: string | null;
    from: number;
    last_page: number;
    last_page_url: string | null;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

export interface LocationsResponse {
    data: DriverLocation[];
    links: any;
    meta: any;
}

export interface StatusLogsResponse {
    data: DriverStatusLog[];
    links: any;
    meta: any;
}

// Interfaces del Componente DriverAvatarProps

export interface DriverAvatarProps {
    name: string;
    code?: string;
}

// Interfaces del componente DriverListCard
export interface DriverListCardProps {
    driver: DriverResource;
    selected: boolean;
    onSelect: () => void;
    onCenter: () => void;
    onHistory: () => void;
}

// Interfaces del componente DriverRow

export interface DriverRowProps {
    driver: DriverResource;
    onViewOnMap?: (driver: DriverResource) => void;
    onRefresh?: () => void;
}

//Interfaces del componente DriverTableProps
export interface DriverTableProps {
    drivers: DriverResource[];
    isLoading: boolean;
    onViewOnMap?: (driver: DriverResource) => void;
    onRefresh?: () => void;
}

//Interfaces del componente MapView

export interface MapEffectsProps {
    drivers: DriverResource[];
    focusTarget: { id: string; ts: number } | null;
    selectedId: string | null;
}

export interface MapViewProps {
    drivers: DriverResource[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    onShowHistory: (id: string) => void;
    focusTarget: { id: string; ts: number } | null;
}

//INterfaces del componente MonitorSidebar
export interface MonitorSidebarProps {
    drivers: DriverResource[];
    counts: Record<SidebarFilter, number>;
    search: string;
    onSearchChange: (v: string) => void;
    filter: SidebarFilter;
    onFilterChange: (f: SidebarFilter) => void;
    selectedId: number | null;
    onSelect: (id: number) => void;
    onCenter: (id: number) => void;
    onHistory: (id: number) => void;
}


// Interfaces del Componente RouteHistoryModal

export interface HistoryPoint {
    lat: number;
    lng: number;
    time: string;
    label?: string;
    type?: "start" | "end" | "stop";
}

export interface RouteHistoryModalProps {
    driver: DriverResource | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export interface UseRouteHistoryProps {
    driverId: number | undefined;
    enabled?: boolean;
}


//Interfaces del componente StatsBar
export interface StatsBarProps {
    stats: DriversStats | undefined;
    isLoading: boolean;
}

//Interfaces del componente StatusBadge

export interface StatusBadgeProps {
    status: DriverStatus;
}

//Interface del componente ViewToggle

export interface ViewToggleProps {
    view: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

// Interfaces del componente monitoreo.hooks.ts


export interface LocationTrackerState {
    isTracking: boolean;
    lastLocation: GeolocationPosition | null;
    error: string | null;
    isDeviceValid: boolean;
}

//interfaces del componente monitoreo.actions.ts

export interface DeviceStatusResponse {
    is_active: boolean;
    serial: string | null;
    equipment_id: number | null;
    equipment_name: string | null;
}
export interface RegisterDeviceResponse {
    success: boolean;
    message: string;
    data: {
        device_id: string;
    };
}
export interface ValidateSerialResponse {
    success: boolean;
    valid: boolean;
    data?: {
        equipment_id: number;
        equipment_name: string;
        serial: string;
    };
    message?: string;
}