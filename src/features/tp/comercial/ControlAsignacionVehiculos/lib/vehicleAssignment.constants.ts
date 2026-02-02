import { type ModelComplete } from "@/core/core.interface";
import { VehicleAssignmentControlResource } from "./vehicleAssignment.interface";

const ROUTE = "control-asignacionVehiculos";
const ABSOLUTE_ROUTE = `/tp/comercial-tp/${ROUTE}`;

export const VEHICLEASSIGNMENTCONTROL: ModelComplete<VehicleAssignmentControlResource> =
  {
    MODEL: {
      name: "Asignación de Vehiculo",
      plural: "Asignación de Vehiculos",
      gender: true,
    },
    ICON: "ContactRound",
    ENDPOINT: "/tp/comercial/opVehicleAssignment/control-vehicleAssignment",
    QUERY_KEY: "ControlVechicleAssignment",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/add`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/update`,
  };
