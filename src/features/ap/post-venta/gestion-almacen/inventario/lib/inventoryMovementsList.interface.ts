/**
 * Interfaces del LIST de movimientos de inventario.
 *
 * El endpoint de listado (`/inventoryMovements/product/{p}/warehouse/{w}/history`
 * y `/inventoryMovements/kardex`) devuelve una fila APLANADA y liviana: no trae
 * los recursos anidados completos (producto, orden de compra, cotización, etc.),
 * sino solo los campos que la tabla necesita para pintar cada columna.
 *
 * El detalle completo se obtiene aparte con el endpoint `show` ({id}) y usa
 * `InventoryMovementResource` de `inventoryMovements.interface.ts`.
 *
 * Mantener estos tipos separados evita que la fila del list "herede" campos
 * que la API nunca manda en el listado.
 */
import { type Links, type Meta } from "@/shared/lib/pagination.interface.ts";
import { InventoryMovementDetail } from "./inventoryMovements.interface.ts";

/** Tipo de movimiento devuelto por la API. */
export type InventoryMovementListType =
  | "PURCHASE_RECEPTION"
  | "SALE"
  | "ADJUSTMENT_IN"
  | "ADJUSTMENT_OUT"
  | "TRANSFER_OUT"
  | "TRANSFER_IN"
  | "RETURN_IN"
  | "RETURN_OUT";

/** Almacén slim que viaja en la fila del list. */
export interface InventoryMovementListWarehouse {
  description: string;
  dyn_code: string | null;
}

/**
 * Documento electrónico slim del list. Presente en SALE y RETURN_IN aunque
 * `reference` sea null: es la fuente para pintar cliente / factura / NC.
 */
export interface InventoryMovementListElectronicDocument {
  full_number: string | null;
  status: string | null;
  cliente_denominacion: string | null;
  cliente_numero_de_documento: string | null;
  credit_note_id: number | null;
  credit_note_number: string | null;
  credit_note_status: string | null;
}

/** Referencia slim para SALE / ADJUSTMENT_OUT desde una cotización de taller. */
export interface InventoryMovementListQuotationRef {
  quotation_number: string;
  client: {
    full_name: string;
  };
}

/** Referencia slim para ADJUSTMENT_IN / ADJUSTMENT_OUT desde nota interna. */
export interface InventoryMovementListInternalNoteRef {
  number: string;
  work_order_correlative?: string | null;
}

/**
 * Referencia que puede traer la fila del list. Su forma real depende de
 * `reference_type` y es un subconjunto de lo que devuelve el `show`; las
 * columnas la reducen a la forma concreta con un cast según el tipo, así que
 * la tipamos laxa (igual que el fallback `Record<string, any>` del `show`).
 */
export type InventoryMovementListReference =
  | InventoryMovementListQuotationRef
  | InventoryMovementListInternalNoteRef
  | Record<string, any>;

/** Una fila del listado de movimientos de inventario. */
export interface InventoryMovementListRow {
  id: number;
  movement_number: string;
  movement_number_dyn: string | null;
  movement_type: InventoryMovementListType | string;
  movement_date: string;
  is_inbound: boolean;
  is_outbound: boolean;
  warehouse_origin: InventoryMovementListWarehouse | null;
  warehouse_destination: InventoryMovementListWarehouse | null;
  reference_type: string | null;
  reference: InventoryMovementListReference | null;
  electronic_document: InventoryMovementListElectronicDocument | null;
  user_name: string | null;
  notes: string | null;
  quantity_in: number | string;
  quantity_out: number | string;
  balance: number;
  /**
   * Solo lo devuelve el endpoint por producto (`/history`); la página lo usa
   * para leer el nombre del producto de la primera fila. No viene en el kardex.
   */
  details?: InventoryMovementDetail[];
}

/** Producto / almacén del contexto de la consulta (endpoint `/history`). */
export interface InventoryMovementListProduct {
  name: string;
  code: string;
  dyn_code: string;
}

export interface InventoryMovementListWarehouseInfo {
  description: string;
  dyn_code: string;
}

/** Respuesta paginada del listado. */
export interface InventoryMovementListResponse {
  data: InventoryMovementListRow[];
  links: Links;
  meta: Meta;
  /** Solo lo devuelve el endpoint por producto (`/history`), no el kardex. */
  product?: InventoryMovementListProduct;
  warehouse?: InventoryMovementListWarehouseInfo;
}
