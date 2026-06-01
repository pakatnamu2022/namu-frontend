// app/features/tp/comercial/Monitoreo/lib/monitoreo.constants.ts

import { type ModelComplete } from "@/core/core.interface";

const ROUTE = "monitoreo";
const ABSOLUTE_ROUTE = `/tp/comercial/${ROUTE}`;

export const MONITOREO: ModelComplete<any> = {
    MODEL: {
        name: "Monitoreo",
        plural: "Monitoreo",
        gender: false,
    },
    ICON: "MapPin",
    ENDPOINT: "/tp/comercial/monitoreo",
    QUERY_KEY: "Monitoreo",
    ROUTE,
    ABSOLUTE_ROUTE,
    ROUTE_ADD: `${ABSOLUTE_ROUTE}/add`,
    ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/update`,
};

export const STATUS_OPTIONS = [
    { value: "all", label: "Todos" },
    { value: "active", label: "Activos" },
    { value: "inactive", label: "Inactivos" },
    { value: "disconnected", label: "Sin Conexión" },
    { value: "nodata", label: "Sin Datos" },
];

export const STATUS_CONFIG = {
    active: {
        label: "Activo",
        bgClass: "bg-green-100",
        textClass: "text-green-700",
        borderClass: "border-green-200",
        iconColor: "text-green-500",
    },
    inactive: {
        label: "Inactivo",
        bgClass: "bg-yellow-100",
        textClass: "text-yellow-700",
        borderClass: "border-yellow-200",
        iconColor: "text-yellow-500",
    },
    disconnected: {
        label: "Sin Conexión",
        bgClass: "bg-red-100",
        textClass: "text-red-700",
        borderClass: "border-red-200",
        iconColor: "text-red-500",
    },
    nodata: {
        label: "Sin Datos",
        bgClass: "bg-gray-100",
        textClass: "text-gray-500",
        borderClass: "border-gray-200",
        iconColor: "text-gray-400",
    },
};