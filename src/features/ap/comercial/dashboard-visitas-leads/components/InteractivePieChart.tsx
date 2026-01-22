import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartStyle,
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
import { useMemo, useState } from "react";
import { Label, Pie, PieChart, Sector } from "recharts";
import { PieSectorDataItem } from "recharts/types/polar/Pie";

// Componente reutilizable para gráficos pie interactivos
interface Props {
  id: string;
  title: string;
  subtitle?: string;
  data: Array<{ name: string; value: number; fill: string }>;
  config: ChartConfig;
  valueLabel?: string;
  showLegend?: boolean;
  footerInfo?: {
    label: string;
    value: string | number;
    trend?: string;
    icon?: React.ReactNode;
  };
}

export function InteractivePieChart({
  id,
  title,
  subtitle,
  data,
  config,
  valueLabel = "Cantidad",
  showLegend = false,
  footerInfo,
}: Props) {
  const [activeItem, setActiveItem] = useState(data[0]?.name || "");

  const activeIndex = useMemo(
    () => data.findIndex((item) => item.name === activeItem),
    [activeItem, data],
  );

  const items = useMemo(() => data.map((item) => item.name), [data]);

  return (
    <Card data-chart={id} className="flex flex-col h-full">
      <ChartStyle id={id} config={config} />
      <CardHeader className="flex flex-wrap gap-2 items-center space-y-0 pb-2">
        <div className="flex flex-col gap-1 w-fit">
          <CardTitle>{title}</CardTitle>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <Select value={activeItem} onValueChange={setActiveItem}>
          <SelectTrigger
            className="ml-auto h-7 w-fit rounded-lg pl-2.5"
            aria-label="Selecciona un valor"
          >
            <SelectValue placeholder="Selecciona" />
          </SelectTrigger>
          <SelectContent align="end" className="rounded-xl">
            {items.map((key) => {
              const itemConfig = config[key as keyof typeof config];

              if (!itemConfig) {
                return null;
              }

              return (
                <SelectItem
                  key={key}
                  value={key}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-sm"
                      style={{
                        backgroundColor: `var(--color-${key})`,
                      }}
                    />
                    {itemConfig?.label}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="flex flex-1 justify-center pb-0">
        <ChartContainer
          id={id}
          config={config}
          className="mx-auto aspect-square w-full max-w-56"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              onClick={(_, index) => {
                const clickedItem = data[index];
                if (clickedItem) {
                  setActiveItem(clickedItem.name);
                }
              }}
              className="cursor-pointer"
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {data[activeIndex]?.value.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          {valueLabel}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <div className="flex flex-col gap-2">
        {showLegend && (
          <div className="flex flex-wrap justify-center gap-2 px-4">
            {data.map((item) => (
              <div
                key={item.name}
                className="flex items-center gap-1.5 text-xs"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-sm"
                  style={{ backgroundColor: `var(--color-${item.name})` }}
                />
                <span className="text-muted-foreground">
                  {config[item.name]?.label || item.name}
                </span>
              </div>
            ))}
          </div>
        )}
        {footerInfo && (
          <CardFooter className="flex-col gap-1 text-sm">
            <div className="flex items-center gap-2 font-medium leading-none">
              {footerInfo.label}: {footerInfo.value}
              {footerInfo.icon}
            </div>
            {footerInfo.trend && (
              <div className="text-muted-foreground text-xs">
                {footerInfo.trend}
              </div>
            )}
          </CardFooter>
        )}
      </div>
    </Card>
  );
}
