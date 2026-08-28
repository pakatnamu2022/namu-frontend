"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  RadialBar,
  RadialBarChart,
  PolarAngleAxis,
  LabelList,
} from "recharts";
import { formatDateShort, formatHours } from "@/core/core.function";
import {
  TechnicianProductivitySummary,
  TechnicianProductivityWorkOrder,
} from "../lib/technicianProductivity.interface";

interface TechnicianProductivityChartsProps {
  summary: TechnicianProductivitySummary;
  workOrders: TechnicianProductivityWorkOrder[];
}

const hoursChartConfig = {
  standard_hours: {
    label: "Horas laborables",
    color: "var(--color-gray-300)",
  },
  billed_hours: {
    label: "Horas facturadas",
    color: "var(--primary)",
  },
};

const gaugeChartConfig = {
  productivity_percentage: {
    label: "Productividad",
    color: "var(--primary)",
  },
};

export default function TechnicianProductivityCharts({
  summary,
  workOrders,
}: TechnicianProductivityChartsProps) {
  const hoursData = [
    {
      name: "Horas",
      standard_hours: summary.standard_hours,
      billed_hours: summary.billed_hours,
    },
  ];

  const gaugeColor =
    summary.productivity_percentage >= 100
      ? "#2563eb"
      : summary.productivity_percentage >= 85
        ? "#16a34a"
        : summary.productivity_percentage >= 70
          ? "#d97706"
          : "#dc2626";

  const gaugeData = [
    {
      name: "productivity",
      value: Math.min(summary.productivity_percentage, 100),
      fill: gaugeColor,
    },
  ];

  // Horas facturadas agrupadas por fecha; cada barra es el total del día,
  // con el detalle de OTs de esa fecha disponible para el tooltip
  const dateMap = new Map<
    string,
    { date: string; items: { ot: string; horas: number }[] }
  >();

  for (const wo of workOrders) {
    const key = wo.fecha_facturacion;
    const existing = dateMap.get(key);
    const item = {
      ot: wo.work_order_number,
      horas: wo.horas_facturadas_tecnico,
    };
    if (existing) {
      existing.items.push(item);
    } else {
      dateMap.set(key, { date: key, items: [item] });
    }
  }

  const dailyChartData = Array.from(dateMap.values())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((entry) => ({
      date: entry.date,
      label: formatDateShort(entry.date),
      items: entry.items,
      horas: entry.items.reduce((sum, item) => sum + item.horas, 0),
    }));

  const dailyChartConfig = {
    horas: { label: "Horas facturadas", color: "var(--primary)" },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Índice de productividad</CardTitle>
          <CardDescription>
            % de horas facturadas vs. laborables
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div className="relative h-56 w-full">
            <ChartContainer
              config={gaugeChartConfig}
              className="aspect-square h-56 w-full"
            >
              <RadialBarChart
                data={gaugeData}
                startAngle={90}
                endAngle={-270}
                innerRadius="70%"
                outerRadius="100%"
              >
                <PolarAngleAxis
                  type="number"
                  domain={[0, 100]}
                  angleAxisId={0}
                  tick={false}
                />
                <RadialBar dataKey="value" background cornerRadius={12} />
              </RadialBarChart>
            </ChartContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-3xl font-bold" style={{ color: gaugeColor }}>
                {summary.productivity_percentage}%
              </div>
              <div className="text-xs text-muted-foreground">productividad</div>
            </div>
          </div>
          <div className="mt-5 text-sm text-muted-foreground text-center">
            {formatHours(summary.billed_hours)} facturadas de{" "}
            {formatHours(summary.standard_hours)} laborables
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Horas laborables vs. facturadas</CardTitle>
          <CardDescription>
            Comparativo del período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 sm:p-4">
          <ChartContainer
            config={hoursChartConfig}
            className="aspect-auto h-56 w-full"
          >
            <BarChart
              accessibilityLayer
              data={hoursData}
              layout="vertical"
              margin={{ left: 12, right: 24, top: 12 }}
            >
              <CartesianGrid horizontal={false} />
              <XAxis type="number" hide />
              <YAxis dataKey="name" type="category" hide />
              <ChartTooltip
                content={({ active, payload }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  return (
                    <div className="rounded-lg border bg-background p-3 shadow-lg space-y-1.5">
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Horas laborables:
                        </span>
                        <span className="text-sm font-bold">
                          {formatHours(summary.standard_hours)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-8">
                        <span className="text-xs text-muted-foreground">
                          Horas facturadas:
                        </span>
                        <span className="text-sm font-bold">
                          {formatHours(summary.billed_hours)}
                        </span>
                      </div>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey="standard_hours"
                fill="var(--color-gray-300)"
                radius={4}
                barSize={36}
              />
              <Bar
                dataKey="billed_hours"
                fill="var(--primary)"
                radius={4}
                barSize={36}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {dailyChartData.length > 0 && (
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Horas facturadas por fecha</CardTitle>
            <CardDescription>
              Órdenes de trabajo facturadas en cada fecha, con sus horas
              respectivas
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 sm:p-4">
            <ChartContainer
              config={dailyChartConfig}
              className="aspect-auto h-72 w-full"
            >
              <BarChart
                accessibilityLayer
                data={dailyChartData}
                margin={{ left: 12, right: 12, top: 24 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-35}
                  textAnchor="end"
                  height={60}
                />
                <YAxis hide />
                <ChartTooltip
                  isAnimationActive={false}
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0)
                      return null;
                    const row = payload[0]?.payload as
                      | {
                          date: string;
                          label: string;
                          items: { ot: string; horas: number }[];
                        }
                      | undefined;
                    if (!row) return null;
                    const total = row.items.reduce(
                      (sum, item) => sum + item.horas,
                      0,
                    );
                    return (
                      <div
                        key={row.date}
                        className="rounded-lg border bg-background p-3 shadow-lg space-y-1.5 min-w-48"
                      >
                        <p className="mb-1 text-xs font-medium text-muted-foreground capitalize">
                          {row.label}
                        </p>
                        {row.items.map((item, index) => (
                          <div
                            key={`${row.date}-${item.ot}-${index}`}
                            className="flex items-center justify-between gap-8"
                          >
                            <span className="text-xs text-muted-foreground">
                              {item.ot}
                            </span>
                            <span className="text-sm font-semibold">
                              {formatHours(item.horas)}
                            </span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between gap-8 pt-1 border-t">
                          <span className="text-xs text-muted-foreground">
                            Total
                          </span>
                          <span className="text-sm font-bold">
                            {formatHours(total)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                />
                <Bar
                  dataKey="horas"
                  fill="var(--primary)"
                  radius={4}
                  barSize={48}
                >
                  <LabelList
                    dataKey="horas"
                    position="top"
                    className="fill-foreground"
                    fontSize={11}
                    fontWeight={600}
                    formatter={(value: number) => formatHours(value)}
                  />
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
