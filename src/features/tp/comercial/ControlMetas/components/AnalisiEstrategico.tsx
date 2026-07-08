"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Users, DollarSign, Calendar, CheckCircle, AlertTriangle, XCircle, RefreshCw, Target, Undo2, ChevronLeft } from "lucide-react";
import {
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Line,
    ComposedChart,
    PieChart,
    Pie,
    Cell,
    Sector,
} from "recharts";
import { useAnalisisEstrategico } from "../lib/GoalTravelControl.hook";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Colores para el gráfico de Pareto
const COLORS = ["#3b82f6", "#60a5fa", "#93bbfc", "#bfdbfe", "#dbeafe", "#e5e7eb", "#f3f4f6"];

export default function AnalisisEstrategico() {
    const hoy = new Date();
    const [fechaInicio, setFechaInicio] = useState<string>(
        new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1).toISOString().split('T')[0]
    );
    const [fechaFin, setFechaFin] = useState<string>(
        new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
    );
    const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
    const [tipoError, setTipoError] = useState<"future" | "rango" | "orden" | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const { data, isLoading, error, refetch } = useAnalisisEstrategico(fechaInicio, fechaFin);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const validarFechas = () => {
        if (!fechaInicio || !fechaFin) {
            setErrorValidacion("Ambas fechas son requeridas.");
            setTipoError(null);
            return false;
        }
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        const hoyDate = new Date();
        hoyDate.setHours(0, 0, 0, 0);

        if (inicio > fin) {
            setErrorValidacion("La fecha inicial no puede ser mayor que la fecha final.");
            setTipoError("orden");
            return false;
        }
        if (fin > hoyDate) {
            setErrorValidacion("La fecha final no puede ser una fecha futura.");
            setTipoError("future");
            return false;
        }
        const diffMonths = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
        if (diffMonths > 24) {
            setErrorValidacion("El rango máximo permitido es de 24 meses.");
            setTipoError("rango");
            return false;
        }
        setErrorValidacion(null);
        setTipoError(null);
        return true;
    };

    useEffect(() => {
        if (fechaInicio && fechaFin) {
            validarFechas();
        }
    }, [fechaInicio, fechaFin]);

    const handleAplicar = () => {
        if (validarFechas()) {
            refetch();
        }
    };

    const ajustarRango = () => {
        if (!fechaFin) return;
        const fin = new Date(fechaFin);
        const inicio = new Date(fin);
        inicio.setMonth(fin.getMonth() - 23);
        setFechaInicio(inicio.toISOString().split('T')[0]);
        setTimeout(() => {
            validarFechas();
            refetch();
        }, 100);
    };
    const retrocederMes = () => {
        if (!fechaFin) return;
        const fin = new Date(fechaFin);
        fin.setMonth(fin.getMonth() - 1);
        setFechaFin(fin.toISOString().split('T')[0]);
        const inicio = new Date(fechaInicio);
        if (inicio > fin) {
            setFechaInicio(fin.toISOString().split('T')[0]);
        }
        setTimeout(() => {
            validarFechas();
            refetch();
        }, 100);
    };
    const resetFechas = () => {
        const hoyDate = new Date();
        setFechaFin(new Date(hoyDate.getFullYear(), hoyDate.getMonth(), 1).toISOString().split('T')[0]);
        setFechaInicio(new Date(hoyDate.getFullYear(), hoyDate.getMonth() - 5, 1).toISOString().split('T')[0]);
        setTimeout(() => {
            setErrorValidacion(null);
            setTipoError(null);
            refetch();
        }, 100);
    };

    if (errorValidacion) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="py-8">
                    <div className="flex flex-col items-center text-center">
                        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                        <p className="text-lg font-medium text-red-700">{errorValidacion}</p>
                        <p className="text-sm text-red-500/70 mt-1">Ajusta el rango de fechas para continuar.</p>

                        <div className="flex flex-wrap gap-3 mt-6 justify-center">
                            {tipoError === "rango" && (
                                <Button
                                    variant="outline"
                                    className="border-red-300 hover:bg-red-50"
                                    onClick={ajustarRango}
                                >
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Ajustar a 24 meses
                                </Button>
                            )}

                            {tipoError === "future" && (
                                <>
                                    <Button
                                        variant="outline"
                                        className="border-red-300 hover:bg-red-50"
                                        onClick={retrocederMes}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Retroceder un mes
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="border-red-300 hover:bg-red-50"
                                        onClick={resetFechas}
                                    >
                                        <Undo2 className="h-4 w-4 mr-2" />
                                        Usar período por defecto
                                    </Button>
                                </>
                            )}

                            {tipoError === "orden" && (
                                <Button
                                    variant="outline"
                                    className="border-red-300 hover:bg-red-50"
                                    onClick={() => {
                                        const temp = fechaInicio;
                                        setFechaInicio(fechaFin);
                                        setFechaFin(temp);
                                        setTimeout(() => {
                                            validarFechas();
                                            refetch();
                                        }, 100);
                                    }}
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Intercambiar fechas
                                </Button>
                            )}

                            {tipoError !== "rango" && (
                                <Button
                                    variant="outline"
                                    className="border-red-300 hover:bg-red-50"
                                    onClick={resetFechas}
                                >
                                    <Undo2 className="h-4 w-4 mr-2" />
                                    Restablecer
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
                <Skeleton className="h-80 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
                <Skeleton className="h-80 w-full" />
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="text-center py-12 text-red-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                    <p className="font-medium">Error al cargar análisis estratégico</p>
                    <p className="text-sm text-red-500/70 mt-1">{(error as Error).message}</p>
                </CardContent>
            </Card>
        );
    }

    if (!data) {
        return (
            <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                    <p>No hay datos disponibles para el período seleccionado</p>
                </CardContent>
            </Card>
        );
    }

    const { tendencia, top_crecimiento, top_decrecimiento, proyeccion, distribucion } = data;

    // Estado del semáforo según cumplimiento proyectado
    const getStatusColor = (porcentaje: number) => {
        if (porcentaje >= 90) return "text-green-600 bg-green-100 border-green-300";
        if (porcentaje >= 70) return "text-yellow-600 bg-yellow-100 border-yellow-300";
        return "text-red-600 bg-red-100 border-red-300";
    };

    const StatusIcon = ({ porcentaje }: { porcentaje: number }) => {
        if (porcentaje >= 90) {
            return <CheckCircle className="h-6 w-6 text-green-500" />;
        }
        if (porcentaje >= 70) {
            return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
        }
        return <XCircle className="h-6 w-6 text-red-500" />;
    };


    return (
        <div className="space-y-6">
            {/* Filtro de rango de fechas */}
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Período de análisis:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="fechaInicio" className="text-sm">Desde:</Label>
                                <Input
                                    id="fechaInicio"
                                    type="date"
                                    value={fechaInicio}
                                    onChange={(e) => setFechaInicio(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="fechaFin" className="text-sm">Hasta:</Label>
                                <Input
                                    id="fechaFin"
                                    type="date"
                                    value={fechaFin}
                                    onChange={(e) => setFechaFin(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAplicar}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Aplicar
                            </Button>
                            <span className="text-xs text-muted-foreground">
                                (Máximo 24 meses)
                            </span>
                            <div className="flex items-center gap-1 ml-2">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={retrocederMes}
                                    className="h-8 w-8 p-0"
                                    title="Retroceder un mes"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetFechas}
                                    className="h-8 px-2 text-xs"
                                    title="Restablecer a últimos 6 meses"
                                >
                                    <Undo2 className="h-3 w-3 mr-1" />
                                    Reset
                                </Button>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm bg-muted/30 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Período analizado:</span>
                            <span className="text-foreground">
                                {data.tendencia.length > 0
                                    ? `${data.tendencia[0]?.periodo || '—'} → ${data.tendencia[data.tendencia.length - 1]?.periodo || '—'}`
                                    : '—'
                                }
                            </span>
                            <Badge variant="outline" className="ml-2 text-xs">
                                {data.tendencia.length} meses
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Tarjetas de resumen */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Producción Acumulada
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(Number(proyeccion.acumulado.toFixed(2)))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {data.tendencia.length > 0
                                ? `Último mes: ${data.tendencia[data.tendencia.length - 1]?.periodo || '-'}`
                                : 'Sin datos'
                            }
                        </div>
                    </CardContent>
                </Card>
                <Card className={cn("border-l-4", getStatusColor(proyeccion.cumplimiento))}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Cumplimiento Proyectado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold">{proyeccion.cumplimiento}%</span>
                            <StatusIcon porcentaje={proyeccion.cumplimiento} />
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {proyeccion.cumplimiento >= 90
                                ? "En buen camino"
                                : proyeccion.cumplimiento >= 70
                                    ? "Cerca de meta"
                                    : "Requiere atención"}
                        </div>
                        <div className="text-xs text-muted-foreground/70 mt-1">
                            Proyectado para {proyeccion.periodo}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de tendencia */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Tendencia de Producción
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Meta vs Real · Línea muestra % de cumplimiento
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                        Período: {tendencia.length > 0
                            ? `${tendencia[0]?.periodo || '—'} → ${tendencia[tendencia.length - 1]?.periodo || '—'}`
                            : 'Sin datos'
                        }
                    </div>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <ComposedChart data={tendencia}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                            <XAxis dataKey="periodo" />
                            <YAxis yAxisId="left" />
                            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
                            <Tooltip
                                formatter={(value, name) => {
                                    if (name === '% Cumplimiento') return `${value}%`;
                                    return `${formatCurrency(Number(value))}`;
                                }}
                            />
                            <Legend />
                            <Bar yAxisId="left" dataKey="meta" fill="#93c5fd" name="Meta" />
                            <Bar yAxisId="left" dataKey="real" fill="#3b82f6" name="Real" />
                            <Line
                                yAxisId="right"
                                type="monotone"
                                dataKey="cumplimiento"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                name="% Cumplimiento"
                            />
                        </ComposedChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Top clientes y Distribución */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Top crecimiento */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-700">
                            <TrendingUp className="h-5 w-5" />
                            Top 5 Clientes en Crecimiento
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                            Comparando últimos dos meses del período
                        </div>
                    </CardHeader>
                    <CardContent>
                        {top_crecimiento.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                No hay clientes con crecimiento en el período
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {top_crecimiento.map((item, index) => (
                                    <li key={item.cliente_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                                            <span className="font-medium">{item.cliente}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                {formatCurrency(Number(item.anterior.toFixed(2)))} → {formatCurrency(Number(item.actual.toFixed(2)))}
                                            </span>
                                            <Badge variant="outline" className="text-green-600 border-green-300">
                                                +{item.variacion}%
                                            </Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Top decrecimiento */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <TrendingDown className="h-5 w-5" />
                            Top 5 Clientes en Decrecimiento
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                            Comparando últimos dos meses del período
                        </div>
                    </CardHeader>
                    <CardContent>
                        {top_decrecimiento.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                No hay clientes con decrecimiento en el período
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {top_decrecimiento.map((item, index) => (
                                    <li key={item.cliente_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                                            <span className="font-medium">{item.cliente}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm">
                                            <span className="text-muted-foreground">
                                                {formatCurrency(Number(item.anterior.toFixed(2)))} → {formatCurrency(Number(item.actual.toFixed(2)))}
                                            </span>
                                            <Badge variant="outline" className="text-red-600 border-red-300">
                                                {item.variacion}%
                                            </Badge>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            { /* CLIENTES NUEVOS E INACTIVOS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Clientes Nuevos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-blue-700">
                            <Users className="h-5 w-5" />
                            Nuevos Clientes
                            <Badge variant="outline" className="ml-2 text-blue-600 border-blue-300">
                                {data.clientes_nuevos?.length || 0}
                            </Badge>
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                            Clientes que aparecen en {data.tendencia[data.tendencia.length - 1]?.periodo || 'el último mes'}
                            pero no en el mes anterior
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!data.clientes_nuevos || data.clientes_nuevos.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                No hay clientes nuevos en este período
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {data.clientes_nuevos.map((item, index) => (
                                    <li key={item.cliente_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                                            <span className="font-medium">{item.cliente}</span>
                                        </div>
                                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                                            +{formatCurrency(Number(item.produccion.toFixed(2)))}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>

                {/* Clientes Inactivos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-gray-700">
                            <Users className="h-5 w-5" />
                            Clientes Inactivos
                            <Badge variant="outline" className="ml-2 text-gray-600 border-gray-300">
                                {data.clientes_inactivos?.length || 0}
                            </Badge>
                        </CardTitle>
                        <div className="text-xs text-muted-foreground">
                            Clientes que aparecieron en el mes anterior pero no en {data.tendencia[data.tendencia.length - 1]?.periodo || 'el último mes'}
                        </div>
                    </CardHeader>
                    <CardContent>
                        {!data.clientes_inactivos || data.clientes_inactivos.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                No hay clientes inactivos en este período
                            </div>
                        ) : (
                            <ul className="space-y-3">
                                {data.clientes_inactivos.map((item, index) => (
                                    <li key={item.cliente_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                                            <span className="font-medium">{item.cliente}</span>
                                        </div>
                                        <Badge variant="outline" className="text-gray-600 border-gray-300">
                                            -{formatCurrency(Number(item.produccion.toFixed(2)))}
                                        </Badge>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Distribución por cliente (Pareto) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-500" />
                        Distribución de Producción por Cliente (Pareto)
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Muestra el % de participación de cada cliente en la producción total del período
                    </div>
                    <div className="text-xs text-muted-foreground/70">
                        Período: {tendencia.length > 0
                            ? `${tendencia[0]?.periodo || '—'} → ${tendencia[tendencia.length - 1]?.periodo || '—'}`
                            : 'Sin datos'
                        }
                    </div>
                </CardHeader>
                <CardContent>
                    {distribucion.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground">
                            No hay datos de distribución
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={distribucion}
                                        dataKey="porcentaje"
                                        nameKey="cliente"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={100}
                                        innerRadius={60}
                                        paddingAngle={2}
                                        activeIndex={activeIndex ?? undefined}
                                        activeShape={(props: any) => {
                                            const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload } = props;
                                            return (
                                                <g>
                                                    <Sector
                                                        cx={cx}
                                                        cy={cy}
                                                        innerRadius={innerRadius}
                                                        outerRadius={outerRadius + 10}
                                                        startAngle={startAngle}
                                                        endAngle={endAngle}
                                                        fill={fill}
                                                    />
                                                    <text
                                                        x={cx}
                                                        y={cy - 20}
                                                        textAnchor="middle"
                                                        className="text-xs font-medium fill-foreground"
                                                    >
                                                        {payload.cliente}
                                                    </text>
                                                    <text
                                                        x={cx}
                                                        y={cy + 10}
                                                        textAnchor="middle"
                                                        className="text-sm font-bold fill-foreground"
                                                    >
                                                        {payload.porcentaje}%
                                                    </text>
                                                    <text
                                                        x={cx}
                                                        y={cy + 30}
                                                        textAnchor="middle"
                                                        className="text-xs fill-muted-foreground"
                                                    >
                                                        {formatCurrency(Number(payload.produccion.toFixed(2)))}
                                                    </text>
                                                </g>
                                            );
                                        }}
                                        onMouseEnter={(_, index) => setActiveIndex(index)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                    >
                                        {distribucion.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [`${value}%`, name]}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Tabla de distribución */}
                            <div className="overflow-auto max-h-[300px]">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left py-2 font-medium">Cliente</th>
                                            <th className="text-right py-2 font-medium">Producción</th>
                                            <th className="text-right py-2 font-medium">%</th>
                                            <th className="text-right py-2 font-medium">Acumulado</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {distribucion.map((item, index) => (
                                            <tr key={index} className="border-b hover:bg-muted/50">
                                                <td className="py-2">{item.cliente}</td>
                                                <td className="text-right">{formatCurrency(Number(item.produccion.toFixed(2)))}</td>
                                                <td className="text-right">
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.porcentaje}%
                                                    </Badge>
                                                </td>
                                                <td className="text-right text-muted-foreground">
                                                    {item.acumulado !== undefined ? `${item.acumulado}%` : '-'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}