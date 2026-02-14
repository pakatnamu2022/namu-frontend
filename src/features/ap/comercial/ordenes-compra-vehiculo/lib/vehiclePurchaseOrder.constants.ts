import { type ModelComplete } from "@/core/core.interface";

// RUTAS PARA MODULO DE COMERCIAL - ORDENES DE COMPRA DE VEHICULO
const ROUTE = "compra-vehiculo-nuevo";
const ABSOLUTE_ROUTE = `/ap/comercial/${ROUTE}`;

export const VEHICLE_PURCHASE_ORDER: ModelComplete = {
  MODEL: {
    name: "Orden de Compra de Vehículo",
    plural: "Órdenes de Compra de Vehículos",
    gender: false,
  },
  ICON: "ShoppingCart",
  ENDPOINT: "/ap/commercial/vehiclePurchaseOrder",
  QUERY_KEY: "vehiclePurchaseOrder",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};

// RUTAS PARA MODULO DE POST-VENTA - FACTURA DE COMPRA
const ROUTE_PV = "factura-compra";
const ABSOLUTE_ROUTE_PV = `/ap/post-venta/gestion-de-almacen/${ROUTE_PV}`;

export const PURCHASE_INVOICE_PV: ModelComplete = {
  MODEL: {
    name: "Factura de Compra",
    plural: "Facturas de Compra",
    gender: false,
  },
  ICON: "FileText",
  ENDPOINT: "/ap/purchase/invoice",
  QUERY_KEY: "purchaseInvoice",
  ROUTE: ROUTE_PV,
  ABSOLUTE_ROUTE: ABSOLUTE_ROUTE_PV,
  ROUTE_ADD: `${ABSOLUTE_ROUTE_PV}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE_PV}/actualizar`,
};
