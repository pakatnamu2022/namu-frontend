import { useQuery } from "@tanstack/react-query";
import { FormDataResponse, VehiculoResponse } from "./vehiculo.interface";
import {
    findVehiculoById,
    getFormData,
    getVehiculos,
} from "./vehiculo.actions";

export const useVehiculos = (params?: Record<string, any>) => {
    return useQuery<VehiculoResponse>({
        queryKey: ["vehicle", params],
        queryFn: () => getVehiculos({ params }),
        refetchOnWindowFocus: false,
    });
};

export const useVehiculoById = (id: number) => {
    return useQuery({
        queryKey: ["vehicle", id],
        queryFn: () => findVehiculoById(id),
        refetchOnWindowFocus: false,
        enabled: !!id && id > 0,
    });
};

export const useFormData = () => {
    return useQuery<FormDataResponse>({
        queryKey: ["vehicle-form-data"],
        queryFn: getFormData,
        refetchOnWindowFocus: false,
        staleTime: 5 * 60 * 1000,
    });
};