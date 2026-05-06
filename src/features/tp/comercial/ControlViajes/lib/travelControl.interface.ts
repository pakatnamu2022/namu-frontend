// travelControl.interface.ts - Actualización

import { type Links, type Meta } from "@/shared/lib/pagination.interface";

export type TripStatus = 'pending' | 'in_progress' | 'completed' | 'fuel_pending';
export type SubTripStatus = 'locked' | 'pending' | 'in_progress' | 'completed';

export interface TravelControlOptionsProps{
    search: string;
    setSearch: (value: string) => void;
    status: TripStatus | "all";
    setStatus: (value: TripStatus | "all") => void;
    userPosition?: string;
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

// Nueva interfaz para SubTrip
export interface SubTrip {
    id: string;
    despacho_id: string | number;
    order: number; 
    name: string;
    origin: string;
    destination: string;
    idorigen: string | number | null;
    iddestino: string | number | null;
    idproducto: string | number | null;
    producto_descripcion: string | null;
    observacion: string | null;
    tiempo_estimado: number | null;
    tipo_flete: string | null;
    unidad_medida_id: string | number | null;
    km_viaje: number | null;
    cantidad: number | null;
    precio_unit: number | null;
    total: number | null;
    statusigv: string | null;
    statusflete: string | null;
    status: SubTripStatus;
    initial_mileage: number | null;
    final_mileage: number | null;  
    total_mileage: number | null; 
    total_hours: number | null;  
    actual_start: string | null; 
    actual_end: string | null; 
    segment_status: SubTripStatus; 
    start_latitude: number | null;
    start_longitude: number | null;
    end_latitude: number | null;
    end_longitude: number | null;
    created_at: string | null;
    updated_at: string | null;
    initialKm?: number | null;
    finalKm?: number | null;
    totalKm?: number | null;
    totalHours?: number | null;
    startTime?: string | null;
    endTime?: string | null;
}

export function mapSubTripFromBackend(backendSubTrip: any): SubTrip {
    return {
        id: backendSubTrip.id,
        despacho_id: backendSubTrip.despacho_id,
        order: backendSubTrip.order,
        name: backendSubTrip.name,
        origin: backendSubTrip.origin,
        destination: backendSubTrip.destination,
        idorigen: backendSubTrip.idorigen,
        iddestino: backendSubTrip.iddestino,
        idproducto: backendSubTrip.idproducto,
        producto_descripcion: backendSubTrip.producto_descripcion,
        observacion: backendSubTrip.observacion,
        tiempo_estimado: backendSubTrip.tiempo_estimado,
        tipo_flete: backendSubTrip.tipo_flete,
        unidad_medida_id: backendSubTrip.unidad_medida_id,
        km_viaje: backendSubTrip.km_viaje,
        cantidad: backendSubTrip.cantidad,
        precio_unit: backendSubTrip.precio_unit,
        total: backendSubTrip.total,
        statusigv: backendSubTrip.statusigv,
        statusflete: backendSubTrip.statusflete,
        status: backendSubTrip.segment_status || backendSubTrip.status,
        initial_mileage: backendSubTrip.initial_mileage ?? backendSubTrip.initialKm,
        final_mileage: backendSubTrip.final_mileage ?? backendSubTrip.finalKm,
        total_mileage: backendSubTrip.total_mileage ?? backendSubTrip.totalKm,
        total_hours: backendSubTrip.total_hours ?? backendSubTrip.totalHours,
        actual_start: backendSubTrip.actual_start ?? backendSubTrip.startTime,
        actual_end: backendSubTrip.actual_end ?? backendSubTrip.endTime,
        segment_status: backendSubTrip.segment_status ?? backendSubTrip.status,
        start_latitude: backendSubTrip.start_latitude,
        start_longitude: backendSubTrip.start_longitude,
        end_latitude: backendSubTrip.end_latitude,
        end_longitude: backendSubTrip.end_longitude,
        created_at: backendSubTrip.created_at,
        updated_at: backendSubTrip.updated_at,
    };
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
    // Nuevo campo para SubTrips
    subTrips?: SubTrip[];
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

// API
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

// Interfaces para operaciones con SubTrips
export interface UpdateSubTripParams {
  id: string;
  status?: SubTripStatus;
  initialKm?: number;
  finalKm?: number;
  totalKm?: number;
  totalHours?: number;
  startTime?: string;
  endTime?: string;
  notes?: string;
}

export interface UpdateSubTripResponse {
  data: SubTrip;
  message: string;
}

export interface GetSubTripsResponse {
  data: SubTrip[];
  message?: string;
}

export interface UpdateMileageParams{
  id: string;
  general_initial_km?: number | null;
  general_final_km?: number | null;
  segments?: Array<{
    id:string;
    initial_mileage?: number | null;
    final_mileage?: number | null;
  }>
}