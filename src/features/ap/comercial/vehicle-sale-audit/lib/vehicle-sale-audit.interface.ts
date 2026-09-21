export type AuditAction = "CORREGIR" | "REVISAR" | "SIN ACCIÓN";

export type AuditCauseCode =
  | "LLEGADA_TARDIA"
  | "NC_SOBRE_REFACTURA"
  | "ANULACION_SOBRE_VENTA_VIGENTE"
  | "GUIA_SOBRE_VENDIDO"
  | "CAMBIO_SIN_MOVIMIENTO"
  | "SIN_CLASIFICAR";

export interface AuditTimelineEvent {
  id: number;
  /** Formato "MM-DD HH:mm". */
  at: string;
  type: string;
  /** "estado previo → estado nuevo". */
  status: string;
  /** "almacén origen → almacén destino" (vacío si no aplica). */
  wh: string;
  note: string;
  /** bad = movimiento que lo devolvió a inventario · sale = venta o entrega. */
  flag: "" | "bad" | "sale";
  /** Solo front (simulación): movimiento reubicado donde debió ocurrir. */
  simulated?: "moved";
  /** Solo front (simulación): fecha real del movimiento reubicado. */
  originalAt?: string;
}

export interface AuditInvoice {
  n: string;
  date: string;
  total: string | number;
  client: string;
}

export interface AuditCancelledInvoice {
  n: string;
  date: string;
  total: string | number;
  kind: string;
  how: string;
}

export interface AuditEarlierExit {
  at: string;
  type: string;
  guide: string | null;
}

export interface VehicleSaleAuditRow {
  vin: string;
  cause: AuditCauseCode;
  current: string;
  target: string;
  wh_current: string;
  wh_target: string;
  wh_changes: boolean;
  invoices: AuditInvoice[];
  cancelled: AuditCancelledInvoice[];
  exit_id: number | null;
  exit_at: string;
  guide: string | null;
  action: AuditAction;
  manual: string[];
  timeline: AuditTimelineEvent[];
  earlier_exits: AuditEarlierExit[];
  happened: string[];
  wrong: string[];
  fix: string;
  prevention: string[];
}

export interface VehicleSaleAuditCause {
  code: AuditCauseCode;
  count: number;
  title: string;
  text: string;
  where: string;
  fix: string;
}

export interface VehicleSaleAuditResponse {
  generated_at: string;
  summary: { total: number; fix: number; review: number; none: number };
  causes: VehicleSaleAuditCause[];
  rows: VehicleSaleAuditRow[];
}
