"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  WorkOrderPlanningResource,
  PLANNING_STATUS_LABELS,
} from "../lib/workOrderPlanning.interface";

interface StatusDistributionChartProps {
  data: WorkOrderPlanningResource[];
}

const COLORS = {
  planned: "#3b82f6",
  in_progress: "#eab308",
  completed: "#22c55e",
  canceled: "#ef4444",
};

export function StatusDistributionChart({
  data,
}: StatusDistributionChartProps) {
  const statusCounts = data.reduce((acc, planning) => {
    acc[planning.status] = (acc[planning.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(statusCounts).map(([status, count]) => ({
    name: PLANNING_STATUS_LABELS[status as keyof typeof PLANNING_STATUS_LABELS],
    value: count,
    status: status,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribución por Estado</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={
                    COLORS[entry.status as keyof typeof COLORS] || "#8884d8"
                  }
                />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0];
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-semibold">{data.name}</div>
                      <div className="text-sm">Cantidad: {data.value}</div>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {chartData.map((entry) => (
            <div key={entry.status} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor:
                    COLORS[entry.status as keyof typeof COLORS] || "#8884d8",
                }}
              />
              <span className="text-sm">
                {entry.name}: {entry.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
