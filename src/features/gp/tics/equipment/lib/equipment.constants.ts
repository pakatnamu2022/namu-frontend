import { type ModelComplete } from "@/core/core.interface";
import { EquipmentRequest } from "./equipment.interface";

const ROUTE = "equipos";
const ABSOLUTE_ROUTE = `/gp/tics/${ROUTE}`;

export const EQUIPMENT: ModelComplete<EquipmentRequest> = {
  MODEL: {
    name: "Equipo",
    plural: "Equipos",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/gp/tics/equipment",
  QUERY_KEY: "equipment",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    marca: "",
    modelo: "",
    tipo_equipo_id: "",
    serie: "",
    detalle: "",
    ram: "",
    almacenamiento: "",
    procesador: "",
    stock_actual: 0,
    estado_uso: "NUEVO",
    sede_id: "",
    pertenece_sede: false,
    fecha_adquisicion: "",
    fecha_garantia: "",
    tipo_adquisicion: "",
    factura: "",
    contrato: "",
    proveedor: "",
  },
};
