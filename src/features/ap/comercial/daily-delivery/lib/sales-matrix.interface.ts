export interface SalesMatrixNode {
  name: string;
  /** Conteo de VIN de enero a diciembre (índice 0 = enero). */
  months: number[];
  total: number;
  children: SalesMatrixNode[];
}

export interface SalesMatrixDetailItem {
  vin: string;
  brand: string;
  family: string;
  model: string;
  shop: string;
  sede: string;
  invoice: string;
  invoice_date: string;
  sale_date: string;
  month: number;
}

export interface SalesMatrixResponse {
  year: number;
  /** Último mes a mostrar (mes actual si es el año en curso, 12 en otro caso). */
  last_month: number;
  filters: { shop: string; sede: string };
  rows: SalesMatrixNode[];
  totals: { months: number[]; total: number };
  detail: SalesMatrixDetailItem[];
}

export interface SalesMatrixParams {
  year: number;
  shop_id?: number[];
  sede_id?: number[];
}
