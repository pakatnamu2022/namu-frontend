"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, BarChart3 } from "lucide-react";
import { useComparativaMensual, useAvailableYearsGoalTravel } from "../lib/GoalTravelControl.hook";
import { MONTHS } from "../lib/GoalTravelControl.constants";


export default function ComparativaMensual() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);

    const { data, isLoading, error } = useComparativaMensual(year, month);
    const { data: availableYears = [] } = useAvailableYearsGoalTravel();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-64 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="text-center py-8 text-red-500">
                    Error al cargar la comparativa: {(error as Error).message}
                </CardContent>
            </Card>
        );
    }

    if (!data || data.clientes.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Comparativa Mensual por Cliente
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        No hay datos para el período seleccionado
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Calcular el máximo de viajes para la escala del gráfico
    const maxViajes = Math.max(
        ...data.viajes_actual,
        ...data.viajes_anterior
    );

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Comparativa Mensual por Cliente
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Período:</span>
                        </div>
                        <Select
                            value={month.toString()}
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
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-blue-500 rounded"></span>
                            <span>{data.periodo_actual.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-4 h-4 bg-orange-400 rounded"></span>
                            <span>{data.periodo_anterior.label}</span>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                        {data.clientes.map((cliente, index) => {
                            const viajesActual = data.viajes_actual[index] || 0;
                            const viajesAnterior = data.viajes_anterior[index] || 0;
                            const porcentajeActual = maxViajes > 0 ? (viajesActual / maxViajes) * 100 : 0;
                            const porcentajeAnterior = maxViajes > 0 ? (viajesAnterior / maxViajes) * 100 : 0;

                            return (
                                <div key={index} className="mb-4">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-medium truncate max-w-[200px]" title={cliente}>
                                            {cliente}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {viajesActual} vs {viajesAnterior}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 h-8">
                                        <div
                                            className="bg-blue-500 h-full rounded-l transition-all duration-500"
                                            style={{ width: `${porcentajeActual}%` }}
                                        />
                                        <div
                                            className="bg-orange-400 h-full rounded-r transition-all duration-500"
                                            style={{ width: `${porcentajeAnterior}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="mt-4 text-sm text-muted-foreground text-center">
                    Barras: {data.periodo_actual.label} (azul) vs {data.periodo_anterior.label} (naranja)
                </div>
            </CardContent>
        </Card>
    );
}