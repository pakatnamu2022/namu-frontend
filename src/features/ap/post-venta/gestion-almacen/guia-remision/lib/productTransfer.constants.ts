import { type ModelComplete } from "@/core/core.interface.ts";
import { ProductTransferResource } from "./productTransfer.interface.ts";
import { BookX, BookCheck, Send, Ban, type LucideIcon } from "lucide-react";
import type { BadgeColor } from "@/components/ui/badge";

const ROUTE = "guia-remision";
const ABSOLUTE_ROUTE = `/ap/post-venta/gestion-de-almacen/${ROUTE}`;

export type TransferStatusKey = "DRAFT" | "APPROVED" | "IN_TRANSIT" | "CANCELLED";

export const TRANSFER_STATUS: Record<
  TransferStatusKey,
  { label: string; color: BadgeColor; icon: LucideIcon }
> = {
  DRAFT:      { label: "Borrador",    color: "gray",  icon: BookX },
  APPROVED:   { label: "Aprobado",    color: "green", icon: BookCheck },
  IN_TRANSIT: { label: "En Tránsito", color: "blue",  icon: Send },
  CANCELLED:  { label: "Cancelado",   color: "red",   icon: Ban },
};

export const PRODUCT_TRANSFER: ModelComplete<ProductTransferResource> = {
  MODEL: {
    name: "Transferencia de Producto",
    plural: "Transferencias de Productos",
    gender: true,
  },
  ICON: "Package",
  ENDPOINT: "/ap/postVenta/inventoryMovements",
  QUERY_KEY: "product-transfers",
  ROUTE,
  ABSOLUTE_ROUTE,
  ROUTE_ADD: `${ABSOLUTE_ROUTE}/agregar`,
  ROUTE_UPDATE: `${ABSOLUTE_ROUTE}/actualizar`,
};
