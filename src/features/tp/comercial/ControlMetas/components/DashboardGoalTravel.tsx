"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Users, Truck } from "lucide-react";
import {
    useDashboardGoalTravelControl,
    useAvailableYearsGoalTravel,
} from "../lib/GoalTravelControl.hook";
import { MONTHS } from "../lib/GoalTravelControl.constants";
export default function DashboardGoalTravel() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

    const { data, isLoading, error } = useDashboardGoalTravelControl(year, month);
    const { data: availableYears = [], isLoading: loadingYears } = useAvailableYearsGoalTravel();

    const getStatusColor = (percentage: number) => {
        if (percentage >= 100) return "bg-green-100 text-green-700";
        if (percentage >= 80) return "bg-yellow-100 text-yellow-700";
        return "bg-red-100 text-red-700";
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return "bg-green-500";
        if (percentage >= 80) return "bg-yellow-500";
        return "bg-red-500";
    };

    if (isLoading || loadingYears) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12 text-red-500">
                <p>Error al cargar el dashboard: {(error as Error).message}</p>
            </div>
        );
    }

    if (!data?.meta) {
        return (
            <div className="text-center py-12">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No hay meta registrada</h3>
                <p className="text-muted-foreground">
                    Para este período ({MONTHS.find((m) => m.value === month.toString())?.label} {year}) no hay meta configurada.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Periodo:</span>
                </div>
                <Select
                    value={month?.toString() || ""}
                    onValueChange={(value) => setMonth(parseInt(value))}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Mes" />
                    </SelectTrigger>
                    <SelectContent>
                        {MONTHS.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                                {m.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select
                    value={year.toString()}
                    onValueChange={(value) => setYear(parseInt(value))}
                >
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Año" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableYears.map((y) => (
                            <SelectItem key={y} value={y.toString()}>
                                {y}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Resumen General */}
            {data.resumen && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Producción Total
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                S/. {Number(data.resumen.produccion_total)?.toFixed(2) || "0.00"}
                            </div>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <Badge variant="outline">
                                    Meta: S/. {Number(data.meta.total)?.toFixed(2) || "0.00"}
                                </Badge>
                                <Badge className={getStatusColor(data.resumen.porcentaje_cumplimiento || 0)}>
                                    {Number(data.resumen.porcentaje_cumplimiento) || 0}%
                                </Badge>
                            </div>
                            <Progress
                                value={Math.min(Number(data.resumen.porcentaje_cumplimiento) || 0, 100)}
                                className="mt-2"
                                indicatorClassName={getProgressColor(Number(data.resumen.porcentaje_cumplimiento) || 0)}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Viajes Realizados
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.resumen.total_viajes || 0}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                <Users className="h-4 w-4 inline mr-1" />
                                Conductores Activos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.resumen.conductores_activos || 0}</div>
                            <div className="text-sm text-muted-foreground">
                                Meta: {data.meta.total_unidades || 0} unidades
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                <Truck className="h-4 w-4 inline mr-1" />
                                Vehículos Activos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{data.resumen.vehiculos_activos || 0}</div>
                            <div className="text-sm text-muted-foreground">
                                Meta: {data.meta.total_unidades || 0} vehículos
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Tabla de Conductores */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Cumplimiento por Conductor
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-medium">Conductor</th>
                                    <th className="text-center py-2 font-medium">Viajes</th>
                                    <th className="text-right py-2 font-medium">Producido</th>
                                    <th className="text-right py-2 font-medium">Meta</th>
                                    <th className="text-right py-2 font-medium">% Cumplimiento</th>
                                    <th className="text-right py-2 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.conductores.map((conductor) => (
                                    <tr key={conductor.conductor_id} className="border-b hover:bg-muted/50">
                                        <td className="py-2 font-medium">{conductor.conductor}</td>
                                        <td className="text-center py-2">{conductor.total_viajes}</td>
                                        <td className="text-right py-2">
                                            S/. {Number(conductor.produccion_real).toFixed(2) || "0.00"}
                                        </td>
                                        <td className="text-right py-2">
                                            S/. {Number(conductor.meta_conductor).toFixed(2) || "0.00"}
                                        </td>
                                        <td className="text-right py-2 font-semibold">
                                            {conductor.porcentaje_cumplimiento || 0}%
                                        </td>
                                        <td className="text-right py-2">
                                            <Badge className={getStatusColor(conductor.porcentaje_cumplimiento || 0)}>
                                                {(conductor.porcentaje_cumplimiento || 0) >= 100
                                                    ? "✓ Meta Superada"
                                                    : (conductor.porcentaje_cumplimiento || 0) >= 80
                                                        ? "⚠ Cerca de Meta"
                                                        : "✗ Bajo Rendimiento"}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {data.conductores.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-muted-foreground">
                                            No hay datos de conductores para este período
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla de Vehículos */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Truck className="h-5 w-5" />
                        Cumplimiento por Vehículo
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-medium">Vehículo</th>
                                    <th className="text-center py-2 font-medium">Viajes</th>
                                    <th className="text-right py-2 font-medium">Producido</th>
                                    <th className="text-right py-2 font-medium">Meta</th>
                                    <th className="text-right py-2 font-medium">% Cumplimiento</th>
                                    <th className="text-right py-2 font-medium">Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.vehiculos.map((vehiculo) => (
                                    <tr key={vehiculo.vehiculo_id} className="border-b hover:bg-muted/50">
                                        <td className="py-2 font-medium">{vehiculo.vehiculo}</td>
                                        <td className="text-center py-2">{vehiculo.total_viajes}</td>
                                        <td className="text-right py-2">
                                            S/. {Number(vehiculo.produccion_real)?.toFixed(2) || "0.00"}
                                        </td>
                                        <td className="text-right py-2">
                                            S/. {Number(vehiculo.meta_vehiculo)?.toFixed(2) || "0.00"}
                                        </td>
                                        <td className="text-right py-2 font-semibold">
                                            {vehiculo.porcentaje_cumplimiento || 0}%
                                        </td>
                                        <td className="text-right py-2">
                                            <Badge className={getStatusColor(vehiculo.porcentaje_cumplimiento || 0)}>
                                                {(vehiculo.porcentaje_cumplimiento || 0) >= 100
                                                    ? "✓ Meta Superada"
                                                    : (vehiculo.porcentaje_cumplimiento || 0) >= 80
                                                        ? "⚠ Cerca de Meta"
                                                        : "✗ Bajo Rendimiento"}
                                            </Badge>
                                        </td>
                                    </tr>
                                ))}
                                {data.vehiculos.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-4 text-muted-foreground">
                                            No hay datos de vehículos para este período
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}