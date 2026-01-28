import { type Links, type Meta } from '@/shared/lib/pagination.interface';


export interface FreightControlResponse {
    data: FreightControlResource[];
    links: Links;
    meta: Meta;
}

export interface FreightControlResource{
    id: number;
    customer_id: number;
    customer: string;
    startPoint_id: number;
    startPoint: string;
    endPoint: string;
    endPoint_id: number;
    tipo_flete: "TONELADAS" | "VIAJE" | "CAJA" | "PALET" | "BOLSA";
    freight: number;
    status_deleted: number;
}

export interface getFreightControlProps{
    params?: Record<string, any>;
}