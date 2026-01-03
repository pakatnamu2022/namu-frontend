
import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export type TripStatus = 'pending' | 'in_progress' | 'completed' | 'fuel_pending';

export interface TravelControlOptionsProps{
    search: string;
    setSearch: (value: string) => void;
    status: TripStatus | "all";
    setStatus: (value: TripStatus | "all") => void;
    userRole?: string;
}
export interface TravelControlDetailModalProps{
  trip: TravelControlResource,
  trigger: React.ReactNode,
  onStatusChange?: (tripId: string, newStatus: TripStatus) => void
}

export interface TravelControlColumnsProps{
  onStartRoute?: (id: string) => void;
  onFinishRoute?: (id: string) => void;
  onCompleteFuel?: (id:string) => void;
  onStatusChange?: (tripId: string, newStatus: TripStatus) => void;
}

export interface TravelControlResponse{
    data: TravelControlResource[];
    links: Links;
    meta: Meta;
}

export interface TravelControlResource {
    id: string;
    codigo: string;
    tripNumber: string;
    estado: number;
    idestado: number;
    estado_descripcion: string | null;
    estado_color: string | null;
    estado_porcentaje: number | null;
    estado_norden: number | null;
    status: TripStatus;
    conductor_id: string | null;
    conductor_nombre: string | null;
    conductor_documento: string | null;
    conductor_telefono: string | null;
    conductor_email: string | null;
    tracto_id: string | null;
    tracto_placa: string | null;
    tracto_marca: string | null;
    tracto_modelo: string | null;
    carreta_id: string | null;
    carreta_placa: string | null;
    plate: string | null;
    cliente_id: string | null;
    cliente_nombre: string | null;
    cliente_ruc: string | null;
    client: string | null;
    ruta: string;
    route: string;
    producto: string;
    ubic_cabecera: string | null;
    ubicacion: string | null;
    km_inicio: number | null;
    km_fin: number | null;
    initialKm: number | null;
    finalKm: number | null;
    totalKm: number | null;
    totalHours: number | null;
    tonnage: number | null;
    fuelAmount: number | null;
    fuelGallons: number | null;
    factorKm: number | null;
    fecha_viaje: string | null;
    fecha_estado: string | null;
    startTime: string | null;
    endTime: string | null;
    observacion_comercial: string | null;
    proxima_prog: string | null;
    produccion: string | null;
    condiciones: string | null;
    nliquidacion: string | null;
    cantidad: number | null;
    items: Array<{
        id: string | number;
        despacho_id: string | number;
        cantidad: number;
        idproducto: string | number;
        idorigen: string | number;
        iddestino: string | number;
        producto_descripcion: string | null;
        origen_descripcion: string | null;
        destino_descripcion: string | null;
    }>;
    driver_records: Array<{
        id: string | number;
        dispatch_id: string | number;
        record_type: string;
        recorded_at: string;
        recorded_mileage: number | null;
        notes: string | null;
        device_id: string | null;
        sync_status: string;
        recorded_at_human: string | null;
        record_type_label: string;
    }>;
    gastos: any[];
    photos: Array<{
        id: number;
        dispatch_id: number;
        driver_id: number;
        photo_type: string;
        file_name: string;
        public_url: string;
        latitude: number | null;
        longitude: number | null;
        has_geolocation: boolean;
        formattedDate: string;
    }>;
    proximocod: string;
    proximoruta: string;
    pendientecond: number;
    pendientetracto: number;
    pendientecarreta: number;
    driver?: {
        id: string | null;
        name: string | null;
        license_number?: string | null;
        phone?: string | null;
        email?: string | null;
    };
    vehicle?: {
        id: string | null;
        placa: string | null;
        marca?: string | null;
        modelo?: string | null;
    };
    estado_info?: {
        descripcion: string | null;
        color: string | null;
        porcentage?: number | null;
        norden: number | null;
    };
    created_at: string | null;
    updated_at: string | null;
    user_id: string | null;
    previousFinalKm: number;
    hasEmptySegment: boolean;
    obs_cistas: string | null;
    obs_combustible: string | null;
    obs_adic_1: string | null;
    obs_adic_2: string | null;
    obs_adic_3: string | null;
    obs_adic_4: string | null;
    obs_adic_5: string | null;
    obs_adic_6: string | null;
    obs_adic_7: string | null;
    obs_adic_8: string | null;
    statistics?: {
        total_items: number;
        total_driver_records: number;
        total_expenses: number;
        total_photos: number;
        has_fuel_expense: boolean;
    };
    metadata?: {
        is_active: boolean;
        can_start: boolean;
        can_end: boolean;
        can_add_fuel: boolean;
        can_upload_photos: boolean;
    };
    mapped_status: string;
}

export interface DriverResource {
  id: string;
  name: string;
  license_number?: string;
  phone?: string;
  email?: string;
}
export interface GetTripsProps {
  params?: Record<string, any>;
  search?: string;
  status?: TripStatus | 'all';
  page?: number;
  per_page?: number;
}
export type UserRole = 'CONDUCTOR TP' | 'COMERCIAL Y FACTURACION TP';

//API
export interface ApiResponse<T = any>{
  data?: T;
  message?: string;
  success?: boolean;
  error?: string;
}

export interface TravelByIdResponse {
  data: TravelControlResource;
  message?: string;
}
export interface ViajesListResponse {
  data: TravelControlResource[];
  links: Links;
  meta: Meta;
  message?: string;
}
export interface LaravelPaginatedResponse<T> {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    links: Array<{
      url: string | null;
      label: string;
      active: boolean;
    }>;
    path: string;
    per_page: number;
    to: number;
    total: number;
  };
}
