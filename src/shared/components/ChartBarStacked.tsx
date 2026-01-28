"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

export interface StackedBarSegment {
  key: string;
  label: string;
  color: string;
}

export interface StackedBarDataItem {
  category: string;
  [segmentKey: string]: string | number;
}

export interface ChartBarStackedProps {
  title?: string;
  description?: string;
  data: StackedBarDataItem[];
  segments: StackedBarSegment[];
  categoryKey?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  showYAxis?: boolean;
  className?: string;
}

export function ChartBarStacked({
  title,
  description,
  data,
  segments,
  categoryKey = "category",
  showLegend = true,
  showGrid = true,
  showYAxis = false,
  className,
}: ChartBarStackedProps) {
  const chartConfig = segments.reduce<ChartConfig>((acc, segment) => {
    acc[segment.key] = {
      label: segment.label,
      color: segment.color,
    };
    return acc;
  }, {});

  return (
    <Card className={className}>
      {(title || description) && (
        <CardHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            {showGrid && <CartesianGrid vertical={false} />}
            <XAxis
              dataKey={categoryKey}
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            {showYAxis && <YAxis tickLine={false} axisLine={false} />}
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            {showLegend && <ChartLegend content={<ChartLegendContent />} />}
            {segments.map((segment, index) => {
              const isFirst = index === 0;
              const isLast = index === segments.length - 1;
              const radius: [number, number, number, number] = isFirst
                ? [0, 0, 4, 4]
                : isLast
                  ? [4, 4, 0, 0]
                  : [0, 0, 0, 0];

              return (
                <Bar
                  key={segment.key}
                  dataKey={segment.key}
                  stackId="stack"
                  fill={segment.color}
                  radius={radius}
                />
              );
            })}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
