"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Calendar, BarChart3, TrendingUp, TrendingDown, AlertCircle, RefreshCw } from "lucide-react";
import { useComparativaMensual, useAvailableYearsGoalTravel } from "../lib/GoalTravelControl.hook";
import { MONTHS } from "../lib/GoalTravelControl.constants";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ComparativaMensual() {
    const hoy = new Date();
    //periodo 01:
    const [year1, setYear1] = useState<number>(hoy.getFullYear());
    const [month1, setMonth1] = useState<number>(hoy.getMonth() + 1);

    //periodo 02: mes anterior por defecto
    const [year2, setYear2] = useState<number>(hoy.getFullYear());
    const [month2, setMonth2] = useState<number>(() => {
        const mes = hoy.getMonth();
        if (mes === 0) {
            return 12;
        }
        return mes;
    })


    const [compararPersonalizado, setCompararPersonalizado] = useState<boolean>(false);

    // Validación de fechas futuras
    const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
    const [tipoError, setTipoError] = useState<"future" | "igual" | null>(null);

    const { data, isLoading, error } = useComparativaMensual(
        year1,
        month1,
        compararPersonalizado ? year2 : undefined,
        compararPersonalizado ? month2 : undefined
    );
    const { data: availableYears = [] } = useAvailableYearsGoalTravel();

    // Validar fechas al cambiar
    useEffect(() => {
        validarFechas();
    }, [year1, month1, year2, month2, compararPersonalizado]);

    const validarFechas = () => {
        const ahora = new Date();
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), 1);

        const fecha1 = new Date(year1, month1 - 1, 1);
        const esFuturo1 = fecha1 > hoy;

        let esFuturo2 = false;
        if (compararPersonalizado) {
            const fecha2 = new Date(year2, month2 - 1, 1);
            esFuturo2 = fecha2 > hoy;
        }

        if (esFuturo1) {
            setErrorMensaje("El período principal no puede ser una fecha futura.");
            setTipoError("future");
            return;
        }

        if (esFuturo2) {
            setErrorMensaje("El período de comparación no puede ser una fecha futura.");
            setTipoError("future");
            return;
        }

        if (compararPersonalizado && year1 === year2 && month1 === month2) {
            setErrorMensaje("Los períodos de comparación no pueden ser iguales.");
            setTipoError("igual");
            return;
        }

        setErrorMensaje(null);
        setTipoError(null);
    };

    // Función para ajustar automáticamente el período 2
    const ajustarPeriodo2 = () => {
        if (tipoError === "igual") {
            // Buscar un mes diferente dentro del mismo año
            let nuevoMes = month2 - 1;
            let nuevoAnio = year2;
            if (nuevoMes === 0) {
                nuevoMes = 12;
                nuevoAnio = year2 - 1;
            }
            // Si aún es igual, buscar otro mes
            if (nuevoMes === month1 && nuevoAnio === year1) {
                nuevoMes = month2 + 1;
                if (nuevoMes === 13) {
                    nuevoMes = 1;
                    nuevoAnio = year2 + 1;
                }
            }
            setMonth2(nuevoMes);
            setYear2(nuevoAnio);
        } else if (tipoError === "future") {
            // Ajustar al mes actual
            const ahora = new Date();
            setYear1(ahora.getFullYear());
            setMonth1(ahora.getMonth() + 1);
        }
    };

    // Función para desactivar la comparación personalizada
    const desactivarComparacion = () => {
        setCompararPersonalizado(false);
    };
    // Estado de carga
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

    // Error de red/backend
    if (error) {
        return (
            <Card>
                <CardContent className="text-center py-8 text-red-500">
                    Error al cargar la comparativa: {(error as Error).message}
                </CardContent>
            </Card>
        );
    }

    // Error de validación (fechas futuras, períodos iguales)
    if (errorMensaje) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="py-8">
                    <div className="flex flex-col items-center text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <p className="text-lg font-medium text-red-700">{errorMensaje}</p>
                        <p className="text-sm text-red-500/70 mt-1">Ajusta los períodos seleccionados.</p>

                        <div className="flex flex-wrap gap-3 mt-6 justify-center">
                            {tipoError === "igual" && (
                                <Button
                                    variant="outline"
                                    className="border-red-300 hover:bg-red-50"
                                    onClick={ajustarPeriodo2}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Cambiar período 2
                                </Button>
                            )}

                            {tipoError === "future" && (
                                <Button
                                    variant="outline"
                                    className="border-red-300 hover:bg-red-50"
                                    onClick={ajustarPeriodo2}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Usar mes actual
                                </Button>
                            )}

                            {compararPersonalizado && (
                                <Button
                                    variant="outline"
                                    className="border-red-300 hover:bg-red-50"
                                    onClick={desactivarComparacion}
                                >
                                    Usar comparación automática
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Sin datos
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
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Período 1:</span>
                            </div>
                            <Select value={month1.toString()} onValueChange={(value) => setMonth1(parseInt(value))}>
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
                            <Select value={year1.toString()} onValueChange={(value) => setYear1(parseInt(value))}>
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

                            <div className="flex items-center gap-3 ml-4">
                                <Switch
                                    checked={compararPersonalizado}
                                    onCheckedChange={setCompararPersonalizado}
                                    id="comparar-personalizado"
                                />
                                <Label htmlFor="comparar-personalizado" className="text-sm font-medium cursor-pointer">
                                    Comparar con otro período
                                </Label>
                            </div>
                        </div>

                        {compararPersonalizado && (
                            <div className="flex flex-wrap items-center gap-4 border-t pt-4">
                                <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">Período 2:</span>
                                </div>
                                <Select value={month2.toString()} onValueChange={(value) => setMonth2(parseInt(value))}>
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
                                <Select value={year2.toString()} onValueChange={(value) => setYear2(parseInt(value))}>
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
                        )}

                        {!compararPersonalizado && (
                            <div className="text-sm text-muted-foreground border-t pt-3">
                                Comparando con: <span className="font-medium">{data.periodo_anterior.label}</span>
                                (mes anterior automático)
                            </div>
                        )}
                    </div>
                </CardHeader>
            </Card>

            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-l-4 border-l-blue-500">
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
                <Card className={cn("border-l-4", compararPersonalizado ? "border-l-orange-500" : "border-l-purple-500")}>
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
                        Variación {compararPersonalizado ? 'entre períodos' : 'Mes a Mes'}
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

            {/* Gráfico de Barras */}
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
                            <span className={cn("w-4 h-4 rounded", compararPersonalizado ? "bg-orange-400" : "bg-purple-500")}></span>
                            <span>{data.periodo_anterior.label}</span>
                        </div>
                        {compararPersonalizado && (
                            <span className="text-xs text-muted-foreground">(Personalizado)</span>
                        )}
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
                                                    <span className={cn("w-2 h-2 rounded-full", compararPersonalizado ? "bg-orange-400" : "bg-purple-500")}></span>
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
                                                className={cn("h-full rounded-r transition-all duration-500 hover:opacity-80", compararPersonalizado ? "bg-orange-400" : "bg-purple-500")}
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
                        Barras: {data.periodo_actual.label} (azul) vs {data.periodo_anterior.label}
                        {compararPersonalizado ? ' (personalizado)' : ' (mes anterior automático)'}
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
                                    <th className="text-center py-2 font-medium">Variación</th>
                                </tr>
                                <tr className="border-b text-xs text-muted-foreground">
                                    <th></th>
                                    <th className="text-center">Actual</th>
                                    <th className="text-center">Anterior</th>
                                    <th className="text-center">Actual</th>
                                    <th className="text-center">Anterior</th>
                                    <th className="text-center">%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.clientes.map((cliente, index) => {
                                    const vAct = data.viajes_actual[index] || 0;
                                    const vAnt = data.viajes_anterior[index] || 0;
                                    const pAct = data.produccion_actual[index] || 0;
                                    const pAnt = data.produccion_anterior[index] || 0;
                                    const diffV = vAct - vAnt;
                                    const pctV = vAnt > 0 ? (diffV / vAnt) * 100 : 0;

                                    return (
                                        <tr key={index} className="border-b hover:bg-muted/50">
                                            <td className="py-2 font-medium">{cliente}</td>
                                            <td className="text-center">{vAct}</td>
                                            <td className="text-center">{vAnt}</td>
                                            <td className="text-center">S/. {pAct.toFixed(2)}</td>
                                            <td className="text-center">S/. {pAnt.toFixed(2)}</td>
                                            <td className={`text-center font-medium ${diffV > 0 ? 'text-green-600' : diffV < 0 ? 'text-red-600' : ''}`}>
                                                {diffV !== 0 ? `${diffV > 0 ? '+' : ''}${diffV} (${pctV > 0 ? '+' : ''}${pctV.toFixed(1)}%)` : '-'}
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