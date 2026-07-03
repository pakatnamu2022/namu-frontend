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
import { Calendar, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { useComparativaMensual, useAvailableYearsGoalTravel } from "../lib/GoalTravelControl.hook";
import { MONTHS } from "../lib/GoalTravelControl.constants";
import { Badge } from "@/components/ui/badge";

export default function ComparativaMensual() {
    const [year, setYear] = useState<number>(2024);
    const [month, setMonth] = useState<number>(3);
    const { data, isLoading, error } = useComparativaMensual(year, month);
    const { data: availableYears = [] } = useAvailableYearsGoalTravel();

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
                <Skeleton className="h-64 w-full" />
            </div>
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

    const maxViajes = Math.max(...data.viajes_actual, ...data.viajes_anterior);

    // Calcular variación total
    const varViajes = data.resumen.actual.viajes - data.resumen.anterior.viajes;
    const varProduccion = data.resumen.actual.produccion - data.resumen.anterior.produccion;
    const pctViajes = data.resumen.anterior.viajes > 0 ? (varViajes / data.resumen.anterior.viajes) * 100 : 0;
    const pctProduccion = data.resumen.anterior.produccion > 0 ? (varProduccion / data.resumen.anterior.produccion) * 100 : 0;

    return (
        <div className="space-y-6">
            {/* Filtros */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Período:</span>
                        </div>
                        <Select value={month.toString()} onValueChange={(value) => setMonth(parseInt(value))}>
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
                        <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
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
                </CardHeader>
            </Card>

            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {data.resumen.actual.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.resumen.actual.viajes} viajes</div>
                        <div className="text-lg font-semibold text-green-600">
                            S/. {data.resumen.actual.produccion.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {data.resumen.anterior.label}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.resumen.anterior.viajes} viajes</div>
                        <div className="text-lg font-semibold text-blue-600">
                            S/. {data.resumen.anterior.produccion.toFixed(2)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Variación */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        Variación Mes a Mes
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-6">
                        <div>
                            <span className="text-sm text-muted-foreground">Viajes</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-xl font-bold ${varViajes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {varViajes >= 0 ? '+' : ''}{varViajes}
                                </span>
                                <Badge variant={varViajes >= 0 ? 'outline' : 'default'}>
                                    {pctViajes >= 0 ? '+' : ''}{pctViajes.toFixed(1)}%
                                </Badge>
                                {varViajes >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                            </div>
                        </div>
                        <div>
                            <span className="text-sm text-muted-foreground">Producción</span>
                            <div className="flex items-center gap-2">
                                <span className={`text-xl font-bold ${varProduccion >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {varProduccion >= 0 ? '+' : ''}S/. {varProduccion.toFixed(2)}
                                </span>
                                <Badge variant={varProduccion >= 0 ? 'outline' : 'default'}>
                                    {pctProduccion >= 0 ? '+' : ''}{pctProduccion.toFixed(1)}%
                                </Badge>
                                {varProduccion >= 0 ? <TrendingUp className="h-4 w-4 text-green-600" /> : <TrendingDown className="h-4 w-4 text-red-600" />}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Gráfico de Barras (con tooltip mejorado) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Comparativa por Cliente
                    </CardTitle>
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
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <div className="min-w-[600px]">
                            {data.clientes.map((cliente, index) => {
                                const viajesActual = data.viajes_actual[index] || 0;
                                const viajesAnterior = data.viajes_anterior[index] || 0;
                                const prodActual = data.produccion_actual[index] || 0;
                                const prodAnterior = data.produccion_anterior[index] || 0;
                                const pctActual = data.participacion_actual[index] || 0;
                                const pctAnterior = data.participacion_anterior[index] || 0;

                                const porcentajeActual = maxViajes > 0 ? (viajesActual / maxViajes) * 100 : 0;
                                const porcentajeAnterior = maxViajes > 0 ? (viajesAnterior / maxViajes) * 100 : 0;

                                return (
                                    <div key={index} className="mb-4 group">
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="font-medium truncate max-w-[250px]" title={cliente}>
                                                {cliente}
                                            </span>
                                            <div className="flex gap-4 text-xs text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                                    {viajesActual} v (S/. {prodActual.toFixed(0)})
                                                    <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">
                                                        {pctActual}%
                                                    </span>
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 bg-orange-400 rounded-full"></span>
                                                    {viajesAnterior} v (S/. {prodAnterior.toFixed(0)})
                                                    <span className="text-[10px] bg-orange-100 text-orange-700 px-1 rounded">
                                                        {pctAnterior}%
                                                    </span>
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 h-8">
                                            <div
                                                className="bg-blue-500 h-full rounded-l transition-all duration-500 hover:opacity-80"
                                                style={{ width: `${porcentajeActual}%` }}
                                                title={`${cliente} (Actual): ${viajesActual} viajes, S/. ${prodActual.toFixed(2)}`}
                                            />
                                            <div
                                                className="bg-orange-400 h-full rounded-r transition-all duration-500 hover:opacity-80"
                                                style={{ width: `${porcentajeAnterior}%` }}
                                                title={`${cliente} (Anterior): ${viajesAnterior} viajes, S/. ${prodAnterior.toFixed(2)}`}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <div className="mt-4 text-sm text-muted-foreground text-center">
                        Barras: {data.periodo_actual.label} (azul) vs {data.periodo_anterior.label} (naranja). Hover para ver detalles.
                    </div>
                </CardContent>
            </Card>

            {/* Tabla Detallada */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Detalle por Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-medium">Cliente</th>
                                    <th className="text-center py-2 font-medium" colSpan={2}>Viajes</th>
                                    <th className="text-center py-2 font-medium" colSpan={2}>Producción</th>
                                </tr>
                                <tr className="border-b text-xs text-muted-foreground">
                                    <th></th>
                                    <th className="text-center">Actual</th>
                                    <th className="text-center">Anterior</th>
                                    <th className="text-center">Actual</th>
                                    <th className="text-center">Anterior</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.clientes.map((cliente, index) => {
                                    const vAct = data.viajes_actual[index] || 0;
                                    const vAnt = data.viajes_anterior[index] || 0;
                                    const pAct = data.produccion_actual[index] || 0;
                                    const pAnt = data.produccion_anterior[index] || 0;
                                    const diffV = vAct - vAnt;
                                    const diffP = pAct - pAnt;
                                    const pctV = vAnt > 0 ? (diffV / vAnt) * 100 : 0;
                                    const pctP = pAnt > 0 ? (diffP / pAnt) * 100 : 0;

                                    return (
                                        <tr key={index} className="border-b hover:bg-muted/50">
                                            <td className="py-2 font-medium">{cliente}</td>
                                            <td className="text-center">{vAct}</td>
                                            <td className="text-center">{vAnt}</td>
                                            <td className={`text-center font-medium ${diffV > 0 ? 'text-green-600' : diffV < 0 ? 'text-red-600' : ''}`}>
                                                {diffV !== 0 ? `${diffV > 0 ? '+' : ''}${diffV} (${pctV > 0 ? '+' : ''}${pctV.toFixed(1)}%)` : '-'}
                                            </td>
                                            <td className="text-center">S/. {pAct.toFixed(2)}</td>
                                            <td className="text-center">S/. {pAnt.toFixed(2)}</td>
                                            <td className={`text-center font-medium ${diffP > 0 ? 'text-green-600' : diffP < 0 ? 'text-red-600' : ''}`}>
                                                {diffP !== 0 ? `${diffP > 0 ? '+' : ''}S/. ${diffP.toFixed(2)} (${pctP > 0 ? '+' : ''}${pctP.toFixed(1)}%)` : '-'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}