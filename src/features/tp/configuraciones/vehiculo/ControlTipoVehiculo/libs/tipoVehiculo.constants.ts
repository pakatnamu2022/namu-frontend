import { type ModelComplete } from "@/core/core.interface";
import { TipoVehiculoResource } from "./tipoVehiculo.interface";

const ROUTE = "control-tipo-vehiculo";
const ABSOLUTE_ROUTE = `/tp/comercial-tp/${ROUTE}`;

export const TIPOVEHICULO: ModelComplete<TipoVehiculoResource> = {
    MODEL: {
        name: "tipo de vehículo",
        plural: "tipos de vehículo",
        gender: true,
    },
    ICON: "Truck",
    ENDPOINT: "/tp/comercial/vehicle-type/control-vehicle-type",
    QUERY_KEY: "ControlVehicleType",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/add`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/update`,
    EMPTY: {
        id: 0,
        descripcion: "",
        status_deleted: 1,
        write_id: 0
    }
};