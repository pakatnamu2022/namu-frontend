import { type ModelComplete } from "@/core/core.interface";
import { VehiculoResource } from "./vehiculo.interface";

const ROUTE = "control-vehiculo";
const ABSOLUTE_ROUTE = `/tp/comercial-tp/${ROUTE}`;

export const VEHICULO: ModelComplete<VehiculoResource> = {
    MODEL: {
        name: "vehículo",
        plural: "vehículos",
        gender: true,
    },
    ICON: "Truck",
    ENDPOINT: "/tp/comercial/vehicle/control-vehicle",
    QUERY_KEY: "ControlVehicle",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/add`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/update`,
    EMPTY: {
        id: 0,
        tipo_vehiculo_id: 0,
        placa: "",
        modelo: null,
        marca: null,
        serie_chasis: null,
        motor: null,
        num_mtc: null,
        tarjeta_circulacion: null,
        kilometraje: null,
        tercero: 0,
        capacidad: null,
        capacidad_bruta: null,
        reserva: null,
        capacidad_util: null,
        vehiculo_status: 1,
        status_geotab_km: 0,
        status_matpel: 1,
        status_ubicacion: 1,
        sede_id: 0,
        write_id: 0,
        status_deleted: 1,
    }
};