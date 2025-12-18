import { useMutation, useQuery } from "@tanstack/react-query";
import {
  deleteExhibitionVehicles,
  findExhibitionVehiclesById,
  getAllExhibitionVehicles,
  getExhibitionVehicles,
  getExhibitionVehiclesById,
  storeExhibitionVehicles,
  updateExhibitionVehicles,
} from "./exhibitionVehicles.actions";
import {
  ExhibitionVehiclesRequest,
  getExhibitionVehiclesProps,
} from "./exhibitionVehicles.interface";

// Query para listar con paginación
export const useExhibitionVehicles = (params: getExhibitionVehiclesProps["params"]) => {
  return useQuery({
    queryKey: ["exhibitionVehicles", params],
    queryFn: () => getExhibitionVehicles({ params }),
  });
};

// Query para obtener todos sin paginación
export const useAllExhibitionVehicles = (params?: getExhibitionVehiclesProps["params"]) => {
  return useQuery({
    queryKey: ["exhibitionVehiclesAll", params],
    queryFn: () => getAllExhibitionVehicles({ params }),
  });
};

// Query para obtener por ID
export const useExhibitionVehiclesById = (id: number) => {
  return useQuery({
    queryKey: ["exhibitionVehicles", id],
    queryFn: () => getExhibitionVehiclesById(id),
    enabled: !!id,
  });
};

// Query para find by ID
export const useFindExhibitionVehiclesById = (id: number) => {
  return useQuery({
    queryKey: ["exhibitionVehiclesFind", id],
    queryFn: () => findExhibitionVehiclesById(id),
    enabled: !!id,
  });
};

// Mutation para crear
export const useStoreExhibitionVehicles = () => {
  return useMutation({
    mutationFn: (payload: ExhibitionVehiclesRequest) =>
      storeExhibitionVehicles(payload),
  });
};

// Mutation para actualizar
export const useUpdateExhibitionVehicles = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ExhibitionVehiclesRequest }) =>
      updateExhibitionVehicles(id, payload),
  });
};

// Mutation para eliminar
export const useDeleteExhibitionVehicles = () => {
  return useMutation({
    mutationFn: (id: number) => deleteExhibitionVehicles(id),
  });
};
