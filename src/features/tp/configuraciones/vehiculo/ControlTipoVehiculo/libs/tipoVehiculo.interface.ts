import { Links, Meta } from '@/shared/lib/pagination.interface';

export interface TipoVehiculoResponse {
    data: TipoVehiculoResource[];
    links: Links;
    meta: Meta;
}

export interface TipoVehiculoResource {
    id: number;
    descripcion: string;
    status_deleted: number;
    write_id: number;
    created_at?: string;
    updated_at?: string;
    creator_name?: string | null;
}

export interface GetTipoVehiculoProps {
    params?: Record<string, any>;
}

// Para el formulario
export interface FormDataResponse {
    vehicleTypes: Array<{
        id: string;
        descripcion: string;
    }>;
}