import { SalesMatrixDetailItem } from "./sales-matrix.interface";

export type GroupBy = "shop" | "sede";

export const MONTH_LABELS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Oct",
  "Nov",
  "Dic",
];

const PALETTE = [
  "#2563eb",
  "#f97316",
  "#10b981",
  "#a855f7",
  "#ef4444",
  "#eab308",
  "#06b6d4",
  "#ec4899",
  "#84cc16",
  "#64748b",
];

export const OTHERS_LABEL = "Otros";
export const OTHERS_COLOR = "#94a3b8";

/** Máximo de series con color propio; el resto se agrupa en "Otros". */
export const MAX_SERIES = 8;

export interface RankingItem {
  name: string;
  value: number;
  color: string;
  /** Porcentaje sobre el total del ranking (0–100). */
  share: number;
}

export interface SeriesMeta {
  key: string;
  name: string;
  color: string;
  total: number;
}

export interface MonthlySeries {
  rows: Array<Record<string, string | number>>;
  series: SeriesMeta[];
}

type Dimension = "shop" | "sede" | "brand";

const valueOf = (item: SalesMatrixDetailItem, dimension: Dimension) =>
  item[dimension];

/** Totales por valor de la dimensión, de mayor a menor. */
const totalsBy = (detail: SalesMatrixDetailItem[], dimension: Dimension) => {
  const totals = new Map<string, number>();
  detail.forEach((item) => {
    const name = valueOf(item, dimension);
    totals.set(name, (totals.get(name) ?? 0) + 1);
  });
  return [...totals.entries()].sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
  );
};

/**
 * Color estable por valor: se asigna según el ranking del conjunto completo,
 * así una sede o marca conserva su color aunque se filtre.
 */
export const buildColorMap = (
  detail: SalesMatrixDetailItem[],
  dimension: Dimension,
) => {
  const map = new Map<string, string>();
  totalsBy(detail, dimension).forEach(([name], i) =>
    map.set(name, i < MAX_SERIES ? PALETTE[i % PALETTE.length] : OTHERS_COLOR),
  );
  return map;
};

export const buildRanking = (
  detail: SalesMatrixDetailItem[],
  dimension: Dimension,
  colors: Map<string, string>,
): RankingItem[] => {
  const total = detail.length || 1;
  return totalsBy(detail, dimension).map(([name, value]) => ({
    name,
    value,
    color: colors.get(name) ?? OTHERS_COLOR,
    share: (value / total) * 100,
  }));
};

/** Serie mes a mes por valor de la dimensión (top N + "Otros"). */
export const buildMonthlySeries = (
  detail: SalesMatrixDetailItem[],
  dimension: Dimension,
  lastMonth: number,
  colors: Map<string, string>,
): MonthlySeries => {
  const ranking = totalsBy(detail, dimension);
  const top = ranking.slice(0, MAX_SERIES).map(([name]) => name);
  const hasOthers = ranking.length > MAX_SERIES;

  const keyOf = new Map<string, string>();
  top.forEach((name, i) => keyOf.set(name, `s${i}`));

  const rows = MONTH_LABELS.slice(0, lastMonth).map((label) => {
    const row: Record<string, string | number> = { month: label };
    top.forEach((_, i) => (row[`s${i}`] = 0));
    if (hasOthers) row.others = 0;
    return row;
  });

  detail.forEach((item) => {
    const row = rows[item.month - 1];
    if (!row) return;
    const key = keyOf.get(valueOf(item, dimension)) ?? "others";
    if (key in row) row[key] = (row[key] as number) + 1;
  });

  const series: SeriesMeta[] = top.map((name, i) => ({
    key: `s${i}`,
    name,
    color: colors.get(name) ?? OTHERS_COLOR,
    total: ranking[i][1],
  }));

  if (hasOthers) {
    series.push({
      key: "others",
      name: OTHERS_LABEL,
      color: OTHERS_COLOR,
      total: ranking.slice(MAX_SERIES).reduce((sum, [, n]) => sum + n, 0),
    });
  }

  return { rows, series };
};

export const monthTotals = (
  detail: SalesMatrixDetailItem[],
  lastMonth: number,
) => {
  const counts = Array.from({ length: lastMonth }, () => 0);
  detail.forEach((item) => {
    if (item.month >= 1 && item.month <= lastMonth) counts[item.month - 1]++;
  });
  return counts;
};
