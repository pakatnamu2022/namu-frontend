import { type ModelComplete } from "@/core/core.interface";
import { VehicleStatusResource } from "./vehicleStatus.interface";

const ROUTE = "estados-vehiculo";
const ABSOLUTE_ROUTE = `/ap/configuraciones/vehiculos/${ROUTE}`;

export const VEHICLE_STATUS: ModelComplete<VehicleStatusResource> = {
  MODEL: {
    name: "Estado de Vehículo",
    plural: "Estados de Vehículo",
    gender: true,
  },
  ICON: "ContactRound",
  ENDPOINT: "/ap/configuration/vehicleStatus",
  QUERY_KEY: "vehicleStatus",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
  EMPTY: {
    id: 0,
    code: "",
    description: "",
    use: "",
    color: "",
    status: true,
  },
};

export const VEHICLE_STATUS_ID = {
  PEDIDO_VN: 1,
  VEHICULO_EN_TRANSITO: 2,
  VEHICULO_EN_TRANSITO_DEVUELTO: 3,
  VEHICULO_VENDIDO_NO_ENTREGADO: 4,
  INVENTARIO_VN: 5,
  VEHICULO_VENDIDO_ENTREGADO: 6,
  VEHICULO_FACTURADO: 7,
};
