import { type Links, type Meta } from '@/shared/lib/pagination.interface';
import { SupplierSchema } from './supplyControl.schema';
import { SupplyControlColumns } from '../components/SupplyControlColumns';

export type SupplyStatus = 'active' | 'inactive';

export interface SupplierResource {
    id: number;
    name: string;
    ruc: string | null;
    address: string | null;
    phone: string | null;
    is_active: boolean;
    created_at: string | null;
    updated_at: string | null;
}

export interface SupplyPhotoResource {
    id: number;
    supply_control_id: number;
    digital_file_id: number;
    file_name: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
    uploaded_at: string | null;
    uploaded_by: number | null;
    url: string | null;
    created_at: string | null;
}

export interface SupplyControlResource {
    id: number;
    vehicle: {
        id: number;
        placa: string;
        modelo: string;
        marca: string;
    } | null;
    driver: {
        id: number;
        nombre_completo: string;
        vat: string;
    } | null;
    supplier: SupplierResource | null;
    mileage: number;
    gallons: number;
    is_base: boolean;
    is_base_label: string;
    photo: SupplyPhotoResource | null;
    photo_id: number | null;
    recorded_at: string | null;
    recorded_at_formatted: string | null;
    created_by: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface SupplyControlResponse {
    data: SupplyControlResource[];
    links: Links;
    meta: Meta;
}

export interface SupplyFormData {
    vehicles: Array<{
        id: number;
        placa: string;
        modelo: string;
        marca: string;
    }>;
    drivers: Array<{
        id: number;
        nombre_completo: string;
        vat: string;
    }>;
    suppliers: Array<{
        id: number;
        name: string;
    }>;
}

export interface SupplyStats {
    total: number;
    in_base: number;
    out_of_base: number;
    total_gallons: number;
    last_7_days: number;
}

export interface GetSupplyProps {
    params?: Record<string, any>;
    search?: string;
    vehicle_id?: string;
    driver_id?: string;
    supplier_id?: string;
    is_base?: boolean;
    date_from?: string;
    date_to?: string;
    page?: number;
    per_page?: number;
}

export interface SupplyControlOptionsProps {
    search: string;
    setSearch: (value: string) => void;
    vehicleId: string;
    setVehicleId: (value: string) => void;
    supplierId: string;
    setSupplierId: (value: string) => void;
    isBase: string;
    setIsBase: (value: string) => void;
    dateFrom: string;
    setDateFrom: (value: string) => void;
    dateTo: string;
    setDateTo: (value: string) => void;
    permissions: {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        canExport: boolean;
    };
    suppliers: SupplierResource[];
    vehicles: Array<{ id: number; placa: string }>;
}

export interface SupplyControlDetailModalProps {
    record: SupplyControlResource;
    trigger: React.ReactNode;
    onStatusChange?: (recordId: number, newStatus: 'active' | 'inactive') => void;
    permissions: {
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    };
}

export interface SupplyControlColumnsProps {
    onDelete?: (id: number) => void;
    onEdit?: (id: number) => void;
    onStatusChange?: (recordId: number, newStatus: 'active' | 'inactive') => void;
    permissions: {
        canEdit: boolean;
        canDelete: boolean;
        canExport: boolean;
    };
}

export interface SupplyFormSchema {
    vehicle_id?: number | string;
    driver_id?: number | string;
    supplier_id: number | string;
    mileage: number;
    gallons: number;
    is_base: boolean;
    recorded_at?: string;
    photo?: string;
    photo_name?: string;
    tank_left_photo?: string;
    tank_right_photo?: string;
}


export interface SupplierModalProps {
    id?: number;
    open: boolean;
    onClose: () => void;
    title: string;
    mode: 'create' | 'update';
    onSuccess?: () => void;
}

export interface SupplierFormSchema {
    name: string;
    ruc?: string;
    address?: string;
    phone?: string;
    is_active?: boolean;
}

export interface PhotoUploadFieldProps {
    label: string;
    value?: string | null;
    onChange: (base64: string | null) => void;
    className?: string;
    disabled?: boolean;
    required?: boolean;
    placeholder?: string;
    description?: string;
    accept?: string;
    maxSize?: number;
}

export interface SupplierFormProps {
    defaultValues?: Partial<SupplierSchema>;
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
    mode?: "create" | "update";
    onCancel?: () => void;
}

export interface SupplyControlMobileProps {
    data: SupplyControlResource[];
    isLoading?: boolean;
    onRefresh?: () => void;
    onAdd?: () => void;
    permissions: {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        canExport: boolean;
    };
    isDriver?: boolean;
}
export interface SupplyControlTableMobileProps {
    data: SupplyControlResource[];
    isLoading?: boolean;
    onRefresh?: () => void;
    onAdd?: () => void;
    permissions: {
        canCreate: boolean;
        canUpdate: boolean;
        canDelete: boolean;
        canExport: boolean;
    };
}

export interface SupplyControlTableDesktopProps {
    columns: SupplyControlColumns[];
    data: SupplyControlResource[];
    children?: React.ReactNode;
    isLoading?: boolean;
}

export interface SupplyFabProps {
    onClick: () => void;
    className?: string;
    label?: string;
}

export interface SupplyFormProps {
    defaultValues?: any;
    onSubmit: (data: any) => void;
    isSubmitting?: boolean;
    mode?: "create" | "update";
    onCancel?: () => void;
    vehicles: Array<{ id: number; placa: string; modelo: string; marca: string }>;
    drivers: Array<{ id: number; nombre_completo: string; vat: string }>;
    suppliers: Array<{ id: number; name: string }>;
    isDriver?: boolean;
    isAssistant?: boolean;
    driverId?: number | null;
    isBaseMode?: boolean;
}

export interface SupplyModalProps {
    id?: number;
    open: boolean;
    onClose: () => void;
    title: string;
    mode: "create" | "update";
    onSuccess?: () => void;
}


