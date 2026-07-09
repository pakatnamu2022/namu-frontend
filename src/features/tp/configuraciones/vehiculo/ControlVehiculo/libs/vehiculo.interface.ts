import { Links, Meta } from '@/shared/lib/pagination.interface';

export interface VehiculoResponse {
    data: VehiculoResource[];
    links: Links;
    meta: Meta;
}

export interface VehiculoResource {
    id: number;
    tipo_vehiculo_id: number;
    tipo_vehiculo_descripcion?: string;
    placa: string;
    modelo: string | null;
    marca: string | null;
    serie_chasis: string | null;
    motor: string | null;
    num_mtc: string | null;
    tarjeta_circulacion: string | null;
    kilometraje: number | null;
    tercero: number;
    capacidad: number | null;
    capacidad_bruta: number | null;
    reserva: number | null;
    capacidad_util: number | null;
    vehiculo_status: number;
    status_geotab_km: number;
    status_matpel: number;
    status_ubicacion: number;
    sede_id: number;
    sede_abreviatura?: string;
    write_id: number;
    status_deleted: number;
    ult_manteniento_realizado?: string | null;
    km_mantenimiento?: number | null;
    geotab_serial?: string | null;
    ubicacion?: string | null;
    created_at?: string;
    updated_at?: string;
}

export interface GetVehiculoProps {
    params?: Record<string, any>;
}

export interface FormDataResponse {
    vehicleTypes: Array<{
        id: string;
        descripcion: string;
    }>;
    sedes: Array<{
        id: string;
        abreviatura: string
    }>;
}