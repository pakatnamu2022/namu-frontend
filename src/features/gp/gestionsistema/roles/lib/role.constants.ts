import { RoleResource } from "./role.interface";

export const CREATE_SUCCESS = "Rol creado correctamente";
export const CREATE_ERROR = "Hubo un error al crear rol";
export const UPDATE_SUCCESS = "Rol actualizado correctamente";
export const UPDATE_ERROR = "Hubo un error al actualizar rol";
export const EMPTY_ROLE: RoleResource = {
  id: 0,
  nombre: "",
  descripcion: "",
  users: 0,
};
