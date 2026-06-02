import { useState, useId } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const RANGE_OPTIONS = [
  { value: "3", label: "Últ. 3" },
  { value: "6", label: "Últ. 6" },
  { value: "12", label: "Últ. 12" },
  { value: "all", label: "Todo" },
];

interface DataPoint {
  name: string;
  value: number;
  value2?: number;
}

interface Props {
  title: string;
  description?: string;
  data: DataPoint[];
  valueLabel?: string;
  value2Label?: string;
  valueFormatter?: (value: number) => string;
}

export function ChartAreaDefault({
  title,
  description,
  data,
  valueLabel = "Valor",
  value2Label = "Valor 2",
  valueFormatter,
}: Props) {
  const id = useId();
  const hasSecondSeries = data.some((d) => d.value2 !== undefined);

  const availableRanges = RANGE_OPTIONS.filter(
    (opt) => opt.value === "all" || parseInt(opt.value) < data.length,
  );

  const defaultRange =
    availableRanges.find((o) => o.value === "12") ??
    availableRanges[availableRanges.length - 1];

  const [range, setRange] = useState(defaultRange?.value ?? "all");

  const visibleData =
    range === "all" ? data : data.slice(-parseInt(range));

  const config = {
    value: { label: valueLabel, color: "var(--primary)" },
    ...(hasSecondSeries
      ? { value2: { label: value2Label, color: "var(--chart-3)" } }
      : {}),
  } satisfies ChartConfig;

  const fillId1 = `fill-value-${id}`;
  const fillId2 = `fill-value2-${id}`;

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {availableRanges.length > 1 && (
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger
              className="hidden w-[140px] rounded-lg sm:ml-auto sm:flex"
              aria-label="Seleccionar rango"
            >
              <SelectValue placeholder="Rango" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              {availableRanges.map((opt) => (
                <SelectItem
                  key={opt.value}
                  value={opt.value}
                  className="rounded-lg"
                >
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={config}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={visibleData}>
            <defs>
              <linearGradient id={fillId1} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              {hasSecondSeries && (
                <linearGradient id={fillId2} x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-value2)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-value2)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              )}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="dot"
                  formatter={(value) =>
                    valueFormatter
                      ? valueFormatter(value as number)
                      : (value as number).toLocaleString()
                  }
                />
              }
            />
            {hasSecondSeries && (
              <Area
                dataKey="value2"
                type="natural"
                fill={`url(#${fillId2})`}
                stroke="var(--color-value2)"
                stackId="a"
              />
            )}
            <Area
              dataKey="value"
              type="natural"
              fill={`url(#${fillId1})`}
              stroke="var(--color-value)"
              stackId="a"
            />
            {hasSecondSeries && <ChartLegend content={<ChartLegendContent />} />}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
