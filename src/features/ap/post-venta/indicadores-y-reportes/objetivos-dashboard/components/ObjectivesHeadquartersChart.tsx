"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";
import { HeadquarterSummary } from "../lib/objectivesDashboard.interface";

interface ObjectivesHeadquartersChartProps {
  ranking: HeadquarterSummary[];
}

const chartConfig = {
  objectives: {
    label: "Objetivo",
    color: "var(--color-gray-300)",
  },
  progress: {
    label: "Avance",
    color: "var(--primary)",
  },
};

type SedeDatum = {
  sede: string;
  objectives: number;
  progress: number;
  completion_percentage: number;
};

const formatCurrency = (value: number) =>
  `S/ ${value.toLocaleString("es-PE")}`;

const formatNumber = (value: number) => value.toLocaleString("es-PE");

function SedeTooltip({
  active,
  payload,
  formatValue,
}: {
  active?: boolean;
  payload?: any[];
  formatValue: (value: number) => string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0].payload as SedeDatum;
  return (
    <div className="rounded-lg border bg-background p-3 shadow-lg">
      <p className="mb-2 border-b pb-2 text-xs font-medium text-muted-foreground">
        {item.sede}
      </p>
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-8">
          <span className="text-xs text-muted-foreground">Objetivo:</span>
          <span className="text-sm font-bold">
            {formatValue(item.objectives)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="text-xs text-muted-foreground">Avance:</span>
          <span className="text-sm font-bold">
            {formatValue(item.progress)}
          </span>
        </div>
        <div className="flex items-center justify-between gap-8">
          <span className="text-xs text-muted-foreground">
            Cumplimiento:
          </span>
          <span className="text-sm font-bold">
            {item.completion_percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function SedeBarChart({
  data,
  formatValue,
}: {
  data: SedeDatum[];
  formatValue: (value: number) => string;
}) {
  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-72 w-full">
      <BarChart
        accessibilityLayer
        data={data}
        margin={{ left: 12, right: 12, top: 12 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="sede" tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis hide />
        <ChartTooltip
          content={(props) => (
            <SedeTooltip {...props} formatValue={formatValue} />
          )}
        />
        <Bar dataKey="objectives" fill="var(--color-gray-300)" radius={4} />
        <Bar dataKey="progress" fill="var(--primary)" radius={4}>
          <LabelList
            dataKey="completion_percentage"
            position="top"
            formatter={(value: number) => `${value.toFixed(0)}%`}
            className="fill-foreground text-xs"
          />
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}

function buildSedeData(
  ranking: HeadquarterSummary[],
  predicate: (isVehicularCrossing: boolean) => boolean,
): SedeDatum[] {
  return ranking.reduce<SedeDatum[]>((result, sede) => {
    const concepts = sede.concepts_summary.filter((concept) =>
      predicate(concept.is_vehicular_crossing),
    );
    if (concepts.length === 0) return result;

    const objectives = concepts.reduce((sum, c) => sum + c.objective, 0);
    const progress = concepts.reduce((sum, c) => sum + c.progress, 0);
    const completion_percentage =
      objectives > 0 ? (progress / objectives) * 100 : 0;

    result.push({
      sede: sede.abbreviation || sede.name,
      objectives,
      progress,
      completion_percentage,
    });
    return result;
  }, []);
}

type ViewMode = "monetary" | "vehicular";

export default function ObjectivesHeadquartersChart({
  ranking,
}: ObjectivesHeadquartersChartProps) {
  const [view, setView] = useState<ViewMode>("monetary");

  const monetaryData = buildSedeData(ranking, (isVehicular) => !isVehicular);
  const vehicularData = buildSedeData(ranking, (isVehicular) => isVehicular);

  const hasVehicularData = vehicularData.some(
    (item) => item.objectives > 0 || item.progress > 0,
  );

  const isVehicularView = view === "vehicular" && hasVehicularData;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>Comparativo por Sede</CardTitle>
          <CardDescription>
            {isVehicularView
              ? "Paso vehicular: objetivo vs. avance (unidades)"
              : "Objetivo vs. avance real del período (S/)"}
          </CardDescription>
        </div>

        {hasVehicularData && (
          <Tabs
            value={view}
            onValueChange={(value) => setView(value as ViewMode)}
          >
            <TabsList>
              <TabsTrigger value="monetary">Monetario</TabsTrigger>
              <TabsTrigger value="vehicular">Paso Vehicular</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </CardHeader>
      <CardContent className="px-2 sm:p-4">
        {isVehicularView ? (
          <SedeBarChart data={vehicularData} formatValue={formatNumber} />
        ) : (
          <SedeBarChart data={monetaryData} formatValue={formatCurrency} />
        )}
      </CardContent>
    </Card>
  );
}
