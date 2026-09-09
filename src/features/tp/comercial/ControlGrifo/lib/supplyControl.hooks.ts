import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    getSupplies,
    findSupplyById,
    storeSupply,
    deleteSupply,
    getSupplyStats,
    getSupplyFormData,
    getSuppliers,
    getActiveSuppliers,
    findSupplierById,
    storeSupplier,
    updateSupplier,
    deleteSupplier,
    updateSupply,
    downloadTicketPhoto,
    uploadTicketPhoto,
} from './supplyControl.actions';
import { SUPPLY_CONTROL, SUPPLIER } from './supplyControl.constants';
import { GetSupplyProps, SupplyControlResource } from './supplyControl.interface';
import { ERROR_MESSAGE, errorToast, SUCCESS_MESSAGE, successToast } from '@/core/core.function';
import { SupplierSchema, SupplySchema } from './supplyControl.schema';

const { QUERY_KEY } = SUPPLY_CONTROL;
const { QUERY_KEY: SUPPLIER_QUERY_KEY } = SUPPLIER;

export const useSupplies = (props?: GetSupplyProps) => {
    return useQuery({
        queryKey: [QUERY_KEY, props],
        queryFn: () => getSupplies(props || {}),
        refetchOnWindowFocus: false,
    });
};

export const useSupplyById = (id?: number) => {
    return useQuery({
        queryKey: [QUERY_KEY, 'detail', id],
        queryFn: async () => {
            if (!id) return null;
            const result = await findSupplyById(id);
            return result;
        },
        enabled: !!id,
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

export const useSupplyStats = () => {
    return useQuery({
        queryKey: [QUERY_KEY, 'stats'],
        queryFn: getSupplyStats,
        refetchOnWindowFocus: false,
    });
};

export const useSupplyFormData = () => {
    return useQuery({
        queryKey: [QUERY_KEY, 'form-data'],
        queryFn: getSupplyFormData,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });
};

export const useStoreSupply = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: storeSupply,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'stats'] });
            successToast('Abastecimiento registrado exitosamente');
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || 'Error al registrar el abastecimiento');
        },
    });
};

export const useUpdateSupply = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<any> }) =>
            updateSupply(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.id] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'stats'] });
            successToast('Abastecimiento actualizado exitosamente');
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || 'Error al actualizar el abastecimiento');
        },
    });
};

export const useDeleteSupply = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSupply,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'stats'] });
            successToast('Abastecimiento anulado exitosamente');
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || 'Error al anular el abastecimiento');
        },
    });
};


export const useSuppliers = (params?: { search?: string; active_only?: boolean; page?: number; per_page?: number }) => {
    return useQuery({
        queryKey: [SUPPLIER_QUERY_KEY, params],
        queryFn: () => getSuppliers(params),
        refetchOnWindowFocus: false,
    });
};

export const useActiveSuppliers = () => {
    return useQuery({
        queryKey: [SUPPLIER_QUERY_KEY, 'active'],
        queryFn: getActiveSuppliers,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });
};

export const useSupplierById = (id?: number) => {
    return useQuery({
        queryKey: [SUPPLIER_QUERY_KEY, 'detail', id],
        queryFn: () => findSupplierById(id!),
        enabled: !!id,
        refetchOnWindowFocus: false,
    });
};

export const useStoreSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: storeSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY, 'active'] });
            successToast('Grifo creado exitosamente');
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || 'Error al crear el grifo');
        },
    });
};

export const useUpdateSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: Partial<any> }) =>
            updateSupplier(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY, 'detail', variables.id] });
            queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY, 'active'] });
            successToast('Grifo actualizado exitosamente');
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || 'Error al actualizar el grifo');
        },
    });
};

export const useDeleteSupplier = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteSupplier,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [SUPPLIER_QUERY_KEY, 'active'] });
            successToast('Grifo eliminado exitosamente');
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || 'Error al eliminar el grifo');
        },
    });
};

export const useUploadTicketPhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, photo }: { id: number; photo: string }) =>
            uploadTicketPhoto(id, photo),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'detail', variables.id] });
            successToast("Ticket firmado subido correctamente");
        },
        onError: (error: any) => {
            errorToast(error?.response?.data?.message || "Error al subir el ticket");
        },
    });
};

export const useDownloadTicketPhoto = () => {
    return useMutation({
        mutationFn: ({ photoId, fileName }: { photoId: number; fileName?: string }) =>
            downloadTicketPhoto(photoId, fileName),
        onError: (error: any) => {
            errorToast(error?.message || 'Error al descargar la foto del ticket');
        },
    });
};

export const useSupplierMutation = (
    mode: "create" | "update",
    id?: number,
    options?: {
        onSuccess?: () => void;
        onError?: (error: any) => void;
    }
) => {
    const queryClient = useQueryClient();
    const { QUERY_KEY } = SUPPLIER;

    return useMutation({
        mutationFn: (data: SupplierSchema) =>
            mode === "create" ? storeSupplier(data) : updateSupplier(id!, data),
        onSuccess: async () => {
            successToast(SUCCESS_MESSAGE(SUPPLIER.MODEL, mode));
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'active'] });
            options?.onSuccess?.();
        },
        onError: (error: any) => {
            errorToast(error.response?.data?.message ?? ERROR_MESSAGE(SUPPLIER.MODEL, mode));
            options?.onError?.(error);
        },
    });
};

export const useSupplyMutation = (
    mode: "create" | "update",
    id?: number,
    options?: {
        onSuccess?: (response: { data: SupplyControlResource; message: string }) => void;
        onError?: (error: any) => void;
        onPrint?: (record: SupplyControlResource) => void;
    }
) => {
    const queryClient = useQueryClient();
    const { QUERY_KEY } = SUPPLY_CONTROL;

    return useMutation({
        mutationFn: async (data: SupplySchema) => {
            try {
                const result = mode === "create"
                    ? await storeSupply(data)
                    : await updateSupply(id!, data);
                return result;
            } catch (error) {
                console.error('[useSupplyMutation] Error:', error);
                throw error;
            }
        },
        onSuccess: async (response) => {
            try {
                successToast(SUCCESS_MESSAGE(SUPPLY_CONTROL.MODEL, mode));
            } catch (e) {
                console.log('Error mostrando toast:', e);
            }

            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
            await queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'stats'] });

            options?.onSuccess?.(response);
        },
        onError: (error: any) => {
            try {
                errorToast(error.response?.data?.message ?? ERROR_MESSAGE(SUPPLY_CONTROL.MODEL, mode));
            } catch (e) {
                console.log('Error mostrando error toast:', e);
            }
            options?.onError?.(error);
        },
    });
}




