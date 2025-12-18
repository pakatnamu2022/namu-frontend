"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { WorkOrderPlanningResource } from "../lib/workOrderPlanning.interface";

interface WorkerPerformanceChartProps {
  data: WorkOrderPlanningResource[];
}

export function WorkerPerformanceChart({
  data,
}: WorkerPerformanceChartProps) {
  // Agrupar datos por trabajador
  const workerData = data.reduce((acc, planning) => {
    const workerName = planning.worker_name;
    if (!acc[workerName]) {
      acc[workerName] = {
        name: workerName,
        estimadas: 0,
        reales: 0,
        tareas: 0,
      };
    }
    acc[workerName].estimadas += Number(planning.estimated_hours) || 0;
    acc[workerName].reales += Number(planning.actual_hours) || 0;
    acc[workerName].tareas += 1;
    return acc;
  }, {} as Record<string, { name: string; estimadas: number; reales: number; tareas: number }>);

  const chartData = Object.values(workerData).map((worker) => ({
    ...worker,
    estimadas: parseFloat(worker.estimadas.toFixed(1)),
    reales: parseFloat(worker.reales.toFixed(1)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rendimiento por Trabajador</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              label={{ value: "Horas", angle: -90, position: "insideLeft" }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="font-semibold">{data.name}</div>
                      <div className="text-sm">
                        <div className="text-blue-600">
                          Estimadas: {data.estimadas}h
                        </div>
                        <div className="text-green-600">
                          Reales: {data.reales}h
                        </div>
                        <div className="text-gray-600">
                          Tareas: {data.tareas}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar
              dataKey="estimadas"
              fill="#3b82f6"
              name="Horas Estimadas"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="reales"
              fill="#22c55e"
              name="Horas Reales"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
