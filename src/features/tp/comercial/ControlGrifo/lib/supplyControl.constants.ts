import { type ModelComplete } from "@/core/core.interface";
import { SupplyControlResource } from "./supplyControl.interface";

const ROUTE = "control-abastecimiento";
const ABSOLUTE_ROUTE = `/tp/comercial-tp/${ROUTE}`;

export const SUPPLY_CONTROL: ModelComplete<SupplyControlResource> = {
    MODEL: {
        name: "abastecimiento",
        plural: "abastecimientos",
        gender: true,
    },
    ICON: "Fuel",
    ENDPOINT: "/tp/comercial/supply/control-supply",
    QUERY_KEY: "SupplyControl",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/add`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/update`,
};

export const SUPPLIER: ModelComplete<any> = {
    MODEL: {
        name: "grifo",
        plural: "grifos",
        gender: true,
    },
    ICON: "Fuel",
    ENDPOINT: "/tp/comercial/supply/suppliers",
    QUERY_KEY: "Suppliers",
    ROUTE: "grifos",
    ABSOLUTE_ROUTE: `/tp/comercial-tp/grifos`,
    ROUTE_ADD: `/tp/comercial-tp/grifos/add`,
    ROUTE_UPDATE: `/tp/comercial-tp/grifos/update`,
};

export const SUPPLY_BASE_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "1", label: "En Base" },
    { value: "0", label: "Fuera de Base" },
];