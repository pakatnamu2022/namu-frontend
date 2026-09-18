"use client";

import { ReactNode, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useSalesMatrix } from "../lib/sales-matrix.hook";
import {
  GroupBy,
  MONTH_LABELS,
  MonthlySeries,
  RankingItem,
  buildColorMap,
  buildMonthlySeries,
  buildRanking,
  monthTotals,
} from "../lib/sales-ranking.utils";

const YEARS_BACK = 4;

const GROUP_LABEL: Record<GroupBy, { singular: string; plural: string }> = {
  shop: { singular: "Shop", plural: "Shops" },
  sede: { singular: "Sede", plural: "Sedes" },
};

export default function SalesRankingReport() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [groupBy, setGroupBy] = useState<GroupBy>("shop");
  const [selected, setSelected] = useState<string | null>(null);
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const { data, isLoading, isFetching, error } = useSalesMatrix({ year });

  const years = useMemo(
    () => Array.from({ length: YEARS_BACK + 1 }, (_, i) => currentYear - i),
    [currentYear],
  );

  const detail = useMemo(() => data?.detail ?? [], [data]);
  const lastMonth = data?.last_month ?? 12;

  const groupColors = useMemo(
    () => buildColorMap(detail, groupBy),
    [detail, groupBy],
  );
  const brandColors = useMemo(() => buildColorMap(detail, "brand"), [detail]);

  const groupRanking = useMemo(
    () => buildRanking(detail, groupBy, groupColors),
    [detail, groupBy, groupColors],
  );
  const groupMonthly = useMemo(
    () => buildMonthlySeries(detail, groupBy, lastMonth, groupColors),
    [detail, groupBy, lastMonth, groupColors],
  );

  // Los gráficos de marca se pueden acotar al shop/sede elegido en el ranking.
  const scopedDetail = useMemo(
    () =>
      selected ? detail.filter((item) => item[groupBy] === selected) : detail,
    [detail, groupBy, selected],
  );
  const brandRanking = useMemo(
    () => buildRanking(scopedDetail, "brand", brandColors),
    [scopedDetail, brandColors],
  );
  const brandMonthly = useMemo(
    () => buildMonthlySeries(scopedDetail, "brand", lastMonth, brandColors),
    [scopedDetail, lastMonth, brandColors],
  );

  const bestMonth = useMemo(() => {
    const counts = monthTotals(detail, lastMonth);
    const max = Math.max(0, ...counts);
    return max > 0 ? { label: MONTH_LABELS[counts.indexOf(max)], value: max } : null;
  }, [detail, lastMonth]);

  const changeGroupBy = (value: GroupBy) => {
    setGroupBy(value);
    setSelected(null);
    setHiddenSeries(new Set());
  };

  const toggleSelected = (name: string) =>
    setSelected((prev) => (prev === name ? null : name));

  const toggleSeries = (key: string) =>
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const group = GROUP_LABEL[groupBy];
  const leader = groupRanking[0];
  const topBrand = brandRanking[0];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4">
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Año</div>
            <Select
              value={String(year)}
              onValueChange={(value) => {
                setYear(Number(value));
                setSelected(null);
              }}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-muted-foreground">Comparar por</div>
            <ToggleGroup
              type="single"
              variant="outline"
              value={groupBy}
              onValueChange={(value) => value && changeGroupBy(value as GroupBy)}
            >
              <ToggleGroupItem value="shop">Shop</ToggleGroupItem>
              <ToggleGroupItem value="sede">Sede</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {selected && (
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            {group.singular}: {selected}
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {error ? (
        <div className="rounded-xl bg-destructive/10 p-6 text-center text-sm text-destructive">
          {error instanceof Error
            ? error.message
            : "No se pudo cargar el ranking de ventas."}
        </div>
      ) : isLoading || !data ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-80 animate-pulse rounded-xl bg-muted/40" />
          ))}
        </div>
      ) : detail.length === 0 ? (
        <div className="rounded-xl bg-muted/30 p-10 text-center text-sm text-muted-foreground">
          No hay vehículos vendidos en {year}.
        </div>
      ) : (
        <div className={cn("space-y-5 transition-opacity", isFetching && "opacity-60")}>
          <div className="flex flex-wrap items-end gap-x-10 gap-y-3">
            <Stat label={`Vehículos vendidos ${year}`} value={detail.length} />
            {leader && (
              <Stat
                label={`${group.singular} líder`}
                value={leader.name}
                hint={`${leader.value} vehículos · ${leader.share.toFixed(1)}%`}
              />
            )}
            {topBrand && (
              <Stat
                label={selected ? `Marca líder en ${selected}` : "Marca líder"}
                value={topBrand.name}
                hint={`${topBrand.value} vehículos · ${topBrand.share.toFixed(1)}%`}
              />
            )}
            {bestMonth && (
              <Stat
                label="Mejor mes"
                value={bestMonth.label}
                hint={`${bestMonth.value} vehículos`}
              />
            )}
          </div>

          <Panel
            title={`Evolución mensual por ${group.singular.toLowerCase()}`}
            subtitle="Vehículos vendidos cada mes. Toca una leyenda para ocultar o mostrar su línea."
          >
            <MonthlyLines
              data={groupMonthly}
              hidden={hiddenSeries}
              onToggle={toggleSeries}
            />
          </Panel>

          <div className="grid gap-5 lg:grid-cols-2">
            <Panel
              title={`Ranking por ${group.singular.toLowerCase()}`}
              subtitle={`Quién vende más. Toca una barra para ver sus marcas.`}
            >
              <RankingBars
                items={groupRanking}
                selected={selected}
                onSelect={toggleSelected}
              />
            </Panel>

            <Panel
              title="Ranking por marca"
              subtitle={
                selected
                  ? `Marcas vendidas en ${selected}`
                  : "Marcas vendidas en todas las sedes"
              }
            >
              <RankingBars items={brandRanking} />
            </Panel>
          </div>

          <Panel
            title="Marcas mes a mes"
            subtitle={
              selected
                ? `Vehículos por marca y mes en ${selected}`
                : "Vehículos por marca y mes"
            }
          >
            <MonthlyStacked data={brandMonthly} />
          </Panel>

          <p className="text-xs text-muted-foreground">
            Se cuenta un VIN por el mes de emisión de su comprobante vigente.
            Shop y sede corresponden a la serie del comprobante.
          </p>
        </div>
      )}
    </div>
  );
}

function buildConfig(data: MonthlySeries): ChartConfig {
  return Object.fromEntries(
    data.series.map((s) => [s.key, { label: s.name, color: s.color }]),
  );
}

function MonthlyLines({
  data,
  hidden,
  onToggle,
}: {
  data: MonthlySeries;
  hidden: Set<string>;
  onToggle: (key: string) => void;
}) {
  const config = useMemo(() => buildConfig(data), [data]);

  return (
    <div className="space-y-4">
      <ChartContainer config={config} className="aspect-auto h-72">
        <LineChart
          data={data.rows}
          margin={{ left: -12, right: 12, top: 8, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
          />
          <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
          {data.series.map((s) => (
            <Line
              key={s.key}
              dataKey={s.key}
              type="monotone"
              stroke={s.color}
              strokeWidth={2.5}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              hide={hidden.has(s.key)}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ChartContainer>

      <Legend series={data.series} hidden={hidden} onToggle={onToggle} />
    </div>
  );
}

function MonthlyStacked({ data }: { data: MonthlySeries }) {
  const config = useMemo(() => buildConfig(data), [data]);

  return (
    <div className="space-y-4">
      <ChartContainer config={config} className="aspect-auto h-72">
        <BarChart
          data={data.rows}
          margin={{ left: -12, right: 12, top: 8, bottom: 0 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={40}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" />}
          />
          {data.series.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              stackId="brands"
              fill={s.color}
              isAnimationActive={false}
            />
          ))}
        </BarChart>
      </ChartContainer>

      <Legend series={data.series} />
    </div>
  );
}

function RankingBars({
  items,
  selected,
  onSelect,
}: {
  items: RankingItem[];
  selected?: string | null;
  onSelect?: (name: string) => void;
}) {
  const config: ChartConfig = { value: { label: "Vehículos" } };
  const height = Math.max(180, items.length * 38 + 16);
  const labelWidth = Math.min(
    Math.max(...items.map((item) => item.name.length)) * 7 + 12,
    200,
  );

  return (
    <ChartContainer
      config={config}
      className="aspect-auto"
      style={{ height }}
    >
      <BarChart
        data={items}
        layout="vertical"
        margin={{ left: 0, right: 56, top: 0, bottom: 0 }}
      >
        <YAxis
          dataKey="name"
          type="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={labelWidth}
          interval={0}
        />
        <XAxis type="number" hide domain={[0, "dataMax"]} />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              hideLabel
              formatter={(value, _name, item) => (
                <span className="flex w-full items-center justify-between gap-4">
                  <span>{item.payload.name}</span>
                  <span className="font-mono font-medium tabular-nums">
                    {value} · {item.payload.share.toFixed(1)}%
                  </span>
                </span>
              )}
            />
          }
        />
        <Bar
          dataKey="value"
          radius={5}
          barSize={22}
          isAnimationActive={false}
          cursor={onSelect ? "pointer" : undefined}
          onClick={(entry) => onSelect?.((entry as unknown as RankingItem).name)}
        >
          {items.map((item) => (
            <Cell
              key={item.name}
              fill={item.color}
              fillOpacity={selected && selected !== item.name ? 0.3 : 1}
            />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            className="fill-foreground text-xs font-medium"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function Legend({
  series,
  hidden,
  onToggle,
}: {
  series: MonthlySeries["series"];
  hidden?: Set<string>;
  onToggle?: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-xs">
      {series.map((s) => {
        const off = hidden?.has(s.key);
        return (
          <button
            key={s.key}
            type="button"
            disabled={!onToggle}
            onClick={() => onToggle?.(s.key)}
            className={cn(
              "flex items-center gap-1.5 transition-opacity",
              onToggle ? "cursor-pointer hover:opacity-80" : "cursor-default",
              off && "opacity-40",
            )}
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className={cn(off && "line-through")}>{s.name}</span>
            <span className="tabular-nums text-muted-foreground">{s.total}</span>
          </button>
        );
      })}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl bg-card p-5 shadow-md">
      <div className="mb-4">
        <h3 className="font-semibold">{title}</h3>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {children}
    </section>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold tracking-tight">{value}</div>
      {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}
