import { useQuery } from "@tanstack/react-query";
import { FormDataResponse, TipoVehiculoResponse } from "./tipoVehiculo.interface";
import {
    findTipoVehiculoById,
    getFormData,
    getTipoVehiculo,
} from "./tipoVehiculo.actions";

export const useTipoVehiculos = (params?: Record<string, any>) => {
    return useQuery<TipoVehiculoResponse>({
        queryKey: ["vehicle-type", params],
        queryFn: () => getTipoVehiculo({ params }),
        refetchOnWindowFocus: false,
    });
};

export const useTipoVehiculoById = (id: number) => {
    return useQuery({
        queryKey: ["vehicle-type", id],
        queryFn: () => findTipoVehiculoById(id),
        refetchOnWindowFocus: false,
        enabled: !!id && id > 0,
    });
};

export const useFormData = () => {
    return useQuery<FormDataResponse>({
        queryKey: ["vehicle-type-form-data"],
        queryFn: getFormData,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });
};