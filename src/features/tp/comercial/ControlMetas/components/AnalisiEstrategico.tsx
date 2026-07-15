"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Users,
    Calendar,
    RefreshCw,
    Undo2,
    ChevronLeft,
    LayoutDashboard,
    PieChart,
    Brain,
    Download,
    Share2
} from "lucide-react";
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
    PieChart as RePieChart,
    Pie,
    Cell,
    Sector,
} from "recharts";
import { useAnalisisEstrategico } from "../lib/GoalTravelControl.hook";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PrediccionIA } from "./PrediccionIA";
import { cn } from "@/lib/utils";

// Colores para el gráfico de Pareto
const COLORS = ["#3b82f6", "#60a5fa", "#93bbfc", "#bfdbfe", "#dbeafe", "#e5e7eb", "#f3f4f6"];

// Definición de secciones
type SeccionAnalisis = 'resumen' | 'tendencia' | 'clientes' | 'distribucion' | 'prediccion';

interface Seccion {
    id: SeccionAnalisis;
    label: string;
    icon: React.ReactNode;
    descripcion: string;
}

const SECCIONES: Seccion[] = [
    {
        id: 'resumen',
        label: 'Resumen',
        icon: <LayoutDashboard className="h-4 w-4" />,
        descripcion: 'Vista general del período'
    },
    {
        id: 'tendencia',
        label: 'Tendencia',
        icon: <TrendingUp className="h-4 w-4" />,
        descripcion: 'Evolución de producción'
    },
    {
        id: 'clientes',
        label: 'Clientes',
        icon: <Users className="h-4 w-4" />,
        descripcion: 'Análisis de clientes'
    },
    {
        id: 'distribucion',
        label: 'Distribución',
        icon: <PieChart className="h-4 w-4" />,
        descripcion: 'Pareto por cliente'
    },
    {
        id: 'prediccion',
        label: 'Predicción IA',
        icon: <Brain className="h-4 w-4" />,
        descripcion: 'Modelo predictivo'
    }
];

export default function AnalisisEstrategico() {
    const hoy = new Date();
    const [fechaInicioInput, setFechaInicioInput] = useState<string>(
        new Date(hoy.getFullYear(), hoy.getMonth() - 5, 1).toISOString().split('T')[0]
    );
    const [fechaFinInput, setFechaFinInput] = useState<string>(
        new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0]
    );
    const [fechaInicio, setFechaInicio] = useState<string>(fechaInicioInput);
    const [fechaFin, setFechaFin] = useState<string>(fechaFinInput);
    const [seccionActiva, setSeccionActiva] = useState<SeccionAnalisis>('resumen');

    const [errorValidacion, setErrorValidacion] = useState<string | null>(null);
    const [tipoError, setTipoError] = useState<"future" | "rango" | "orden" | null>(null);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);
    const [modalAbierto, setModalAbierto] = useState<boolean>(false);

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
        if (!fechaInicioInput || !fechaFinInput) {
            setErrorValidacion("Ambas fechas son requeridas.");
            setTipoError(null);
            setModalAbierto(true);
            return false;
        }
        const inicio = new Date(fechaInicioInput);
        const fin = new Date(fechaFinInput);
        const hoyDate = new Date();
        hoyDate.setHours(0, 0, 0, 0);

        if (inicio > fin) {
            setErrorValidacion("La fecha inicial no puede ser mayor que la fecha final.");
            setTipoError("orden");
            setModalAbierto(true);
            return false;
        }
        if (fin > hoyDate) {
            setErrorValidacion("La fecha final no puede ser una fecha futura.");
            setTipoError("future");
            setModalAbierto(true);
            return false;
        }
        const diffMonths = (fin.getFullYear() - inicio.getFullYear()) * 12 + (fin.getMonth() - inicio.getMonth());
        if (diffMonths > 24) {
            setErrorValidacion("El rango máximo permitido es de 24 meses.");
            setTipoError("rango");
            setModalAbierto(true);
            return false;
        }
        setErrorValidacion(null);
        setTipoError(null);
        setModalAbierto(false);
        return true;
    };

    const handleAplicar = () => {
        if (validarFechas()) {
            setFechaInicio(fechaInicioInput);
            setFechaFin(fechaFinInput);
            refetch();
        }
    };

    const ajustarRango = () => {
        if (!fechaFinInput) return;
        const fin = new Date(fechaFinInput);
        const inicio = new Date(fin);
        inicio.setMonth(fin.getMonth() - 23);
        setFechaInicioInput(inicio.toISOString().split('T')[0]);
        setModalAbierto(true);
        setTimeout(() => {
            setFechaInicio(fechaInicioInput);
            setFechaFin(fechaFinInput);
            refetch();
        }, 100);
    };

    const retrocederMes = () => {
        if (!fechaFinInput) return;
        const fin = new Date(fechaFinInput);
        fin.setMonth(fin.getMonth() - 1);
        setFechaFinInput(fin.toISOString().split('T')[0]);
        const inicio = new Date(fechaInicioInput);
        if (inicio > fin) {
            setFechaInicioInput(fin.toISOString().split('T')[0]);
        }
        setModalAbierto(false);
        setTimeout(() => {
            setFechaInicio(fechaInicioInput);
            setFechaFin(fechaFinInput);
            refetch();
        }, 100);
    };

    const resetFechas = () => {
        const hoyDate = new Date();
        const nuevoFin = new Date(hoyDate.getFullYear(), hoyDate.getMonth(), 1).toISOString().split('T')[0];
        const nuevoInicio = new Date(hoyDate.getFullYear(), hoyDate.getMonth() - 5, 1).toISOString().split('T')[0];
        setFechaInicioInput(nuevoInicio);
        setFechaFinInput(nuevoFin);
        setModalAbierto(false);
        setTimeout(() => {
            setFechaInicio(nuevoInicio);
            setFechaFin(nuevoFin);
            refetch();
        }, 100);
    };

    const intercambiarFechas = () => {
        const temp = fechaInicioInput;
        setFechaInicioInput(fechaFinInput);
        setFechaFinInput(temp);
        setModalAbierto(false);
        setTimeout(() => {
            setFechaInicio(fechaInicioInput);
            setFechaFin(fechaFinInput);
            refetch();
        }, 100);
    };

    // Renderizar contenido según sección activa
    const renderContenido = () => {
        if (!data) return null;

        const { tendencia, top_crecimiento, top_decrecimiento, distribucion } = data;

        switch (seccionActiva) {
            case 'resumen':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tarjeta de resumen general */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Resumen del Período</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Meses analizados</span>
                                        <span className="font-medium">{tendencia.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Clientes activos</span>
                                        <span className="font-medium">{distribucion.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Producción total</span>
                                        <span className="font-medium">
                                            {formatCurrency(distribucion.reduce((acc, item) => acc + item.produccion, 0))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Clientes en crecimiento</span>
                                        <span className="font-medium text-green-600">{top_crecimiento.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Clientes en decrecimiento</span>
                                        <span className="font-medium text-red-600">{top_decrecimiento.length}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Tarjeta de métricas rápidas */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Indicadores Clave</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Mejor mes</span>
                                        <span className="font-medium">
                                            {tendencia.reduce((max, item) => item.real > max.real ? item : max, tendencia[0])?.periodo || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Peor mes</span>
                                        <span className="font-medium">
                                            {tendencia.reduce((min, item) => item.real < min.real ? item : min, tendencia[0])?.periodo || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Promedio mensual</span>
                                        <span className="font-medium">
                                            {formatCurrency(tendencia.reduce((acc, item) => acc + item.real, 0) / (tendencia.length || 1))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Mayor crecimiento</span>
                                        <span className="font-medium text-green-600">
                                            {top_crecimiento[0]?.cliente || '-'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-muted-foreground">Mayor decrecimiento</span>
                                        <span className="font-medium text-red-600">
                                            {top_decrecimiento[0]?.cliente || '-'}
                                        </span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'tendencia':
                return (
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
                            <ResponsiveContainer width="100%" height={350}>
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
                );

            case 'clientes':
                return (
                    <div className="space-y-6">
                        {/* RESUMEN EJECUTIVO */}
                        {data.resumen && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-600 font-medium">Total Clientes</p>
                                                <p className="text-2xl font-bold">{data.resumen.total_clientes_actual || 0}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    Vs {data.resumen.total_clientes_anterior || 0} ({data.resumen.periodo_anterior})
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                                <Users className="h-6 w-6 text-blue-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-green-50 to-white border-green-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-green-600 font-medium">En Crecimiento</p>
                                                <p className="text-2xl font-bold text-green-600">{data.resumen.clientes_con_crecimiento || 0}</p>
                                                <p className="text-xs text-green-600">
                                                    {data.resumen.porcentaje_variacion > 0 ? `+${data.resumen.porcentaje_variacion}%` : '0%'} producción
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                                <TrendingUp className="h-6 w-6 text-green-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-red-50 to-white border-red-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-red-600 font-medium">En Decrecimiento</p>
                                                <p className="text-2xl font-bold text-red-600">{data.resumen.clientes_con_decrecimiento || 0}</p>
                                                <p className="text-xs text-red-600">
                                                    {data.resumen.porcentaje_variacion < 0 ? `${data.resumen.porcentaje_variacion}%` : '0%'}
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                                <TrendingDown className="h-6 w-6 text-red-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-200">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-purple-600 font-medium">Nuevos / Inactivos</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl font-bold text-blue-600">{data.resumen.clientes_nuevos || 0}</span>
                                                    <span className="text-muted-foreground">/</span>
                                                    <span className="text-xl font-bold text-gray-600">{data.resumen.clientes_inactivos || 0}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground">{data.resumen.periodo_actual}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                                <Calendar className="h-6 w-6 text-purple-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* INDICADORES ADICIONALES */}
                        {data.resumen && (data.resumen.mejor_mes || data.resumen.peor_mes) && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {data.resumen.mejor_mes && (
                                    <Card className="border-l-4 border-l-green-500">
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">🏆 Mejor Mes</p>
                                                    <p className="text-sm font-semibold">{data.resumen.mejor_mes.periodo}</p>
                                                </div>
                                                <Badge variant="outline" className="text-green-600">
                                                    {formatCurrency(data.resumen.mejor_mes.total)}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                                {data.resumen.peor_mes && (
                                    <Card className="border-l-4 border-l-red-500">
                                        <CardContent className="p-3">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-muted-foreground">⚠️ Peor Mes</p>
                                                    <p className="text-sm font-semibold">{data.resumen.peor_mes.periodo}</p>
                                                </div>
                                                <Badge variant="outline" className="text-red-600">
                                                    {formatCurrency(data.resumen.peor_mes.total)}
                                                </Badge>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        )}

                        {/* TOP 10 CRECIMIENTO */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-green-700">
                                    <TrendingUp className="h-5 w-5" />
                                    Top 10 Clientes en Crecimiento
                                    <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
                                        {data.top_crecimiento.length} clientes
                                    </Badge>
                                </CardTitle>
                                <div className="text-xs text-muted-foreground">
                                    Comparando {data.resumen?.periodo_actual || 'período actual'} vs {data.resumen?.periodo_anterior || 'período anterior'}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {top_crecimiento.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground">
                                        No hay clientes con crecimiento en el período
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {top_crecimiento.slice(0, 10).map((item, index) => (
                                            <div key={item.cliente_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 border-b border-muted/30">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-muted-foreground w-8 text-center">
                                                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium truncate">{item.cliente}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            {item.ruc && <span>RUC: {item.ruc}</span>}
                                                            {item.categoria && (
                                                                <Badge variant="outline" className="text-[10px]">
                                                                    {item.categoria === 'alto_crecimiento' ? '🚀 Alto' : '📈 Creciendo'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm flex-shrink-0">
                                                    <span className="text-muted-foreground hidden sm:inline">
                                                        {formatCurrency(item.anterior)} → {formatCurrency(item.actual)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-green-600 border-green-300">
                                                            +{item.variacion}%
                                                        </Badge>
                                                        {item.tendencia?.tipo === 'creciente_fuerte' && (
                                                            <span className="text-green-600 text-sm">↑↑</span>
                                                        )}
                                                        {item.tendencia?.tipo === 'creciente' && (
                                                            <span className="text-green-500 text-sm">↑</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* TOP 10 DECRECIMIENTO */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-red-700">
                                    <TrendingDown className="h-5 w-5" />
                                    Top 10 Clientes en Decrecimiento
                                    <Badge variant="outline" className="ml-2 text-red-600 border-red-300">
                                        {data.top_decrecimiento.length} clientes
                                    </Badge>
                                </CardTitle>
                                <div className="text-xs text-muted-foreground">
                                    Comparando {data.resumen?.periodo_actual || 'período actual'} vs {data.resumen?.periodo_anterior || 'período anterior'}
                                </div>
                            </CardHeader>
                            <CardContent>
                                {top_decrecimiento.length === 0 ? (
                                    <div className="text-center py-6 text-muted-foreground">
                                        No hay clientes con decrecimiento en el período
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {top_decrecimiento.slice(0, 10).map((item, index) => (
                                            <div key={item.cliente_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 border-b border-muted/30">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-muted-foreground w-8 text-center">
                                                        #{index + 1}
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium truncate">{item.cliente}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            {item.ruc && <span>RUC: {item.ruc}</span>}
                                                            {item.categoria && (
                                                                <Badge variant="outline" className="text-[10px] text-red-600 border-red-200">
                                                                    {item.categoria === 'alto_decrecimiento' ? '⚠️ Crítico' : '📉 Decreciendo'}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm flex-shrink-0">
                                                    <span className="text-muted-foreground hidden sm:inline">
                                                        {formatCurrency(item.anterior)} → {formatCurrency(item.actual)}
                                                    </span>
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-red-600 border-red-300">
                                                            {item.variacion}%
                                                        </Badge>
                                                        {item.tendencia?.tipo === 'decreciente_fuerte' && (
                                                            <span className="text-red-600 text-sm">↓↓</span>
                                                        )}
                                                        {item.tendencia?.tipo === 'decreciente' && (
                                                            <span className="text-red-500 text-sm">↓</span>
                                                        )}
                                                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-blue-600">
                                                            Ver detalle
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* TOP MESES CON MÁS DECRECIMIENTO */}
                        {data.top_meses_decrecimiento && data.top_meses_decrecimiento.length > 0 && (
                            <Card className="border-orange-200 bg-orange-50/30">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-orange-700">
                                        <Calendar className="h-5 w-5" />
                                        Meses con Mayor Decrecimiento
                                        <Badge variant="outline" className="ml-2 text-orange-600 border-orange-300">
                                            {data.top_meses_decrecimiento.length} meses
                                        </Badge>
                                    </CardTitle>
                                    <div className="text-xs text-muted-foreground">
                                        Muestra los meses donde más clientes tuvieron caídas en su producción
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {data.top_meses_decrecimiento.map((mes, index) => (
                                            <div key={index} className="bg-white p-3 rounded-lg border shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-medium">{mes.periodo}</span>
                                                    <Badge variant="outline" className="text-red-600 border-red-200">
                                                        -{formatCurrency(mes.decrementos)}
                                                    </Badge>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {mes.clientes_afectados?.length || 0} clientes afectados
                                                </p>
                                                <div className="mt-1 flex flex-wrap gap-1">
                                                    {(mes.clientes_afectados || []).slice(0, 3).map((cliente, idx) => (
                                                        <span key={idx} className="text-xs bg-muted/50 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                                                            {cliente}
                                                        </span>
                                                    ))}
                                                    {(mes.clientes_afectados?.length || 0) > 3 && (
                                                        <span className="text-xs text-muted-foreground">
                                                            +{mes.clientes_afectados.length - 3} más
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* NUEVOS E INACTIVOS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nuevos Clientes */}
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
                                        Clientes que aparecen en {data.resumen?.periodo_actual || 'período actual'} pero no en {data.resumen?.periodo_anterior || 'período anterior'}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {!data.clientes_nuevos || data.clientes_nuevos.length === 0 ? (
                                        <div className="text-center py-6 text-muted-foreground">
                                            No hay clientes nuevos en este período
                                        </div>
                                    ) : (
                                        <ul className="space-y-3">
                                            {data.clientes_nuevos.slice(0, 5).map((item, index) => (
                                                <li key={item.cliente_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 border">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                                                        <div>
                                                            <span className="font-medium">{item.cliente}</span>
                                                            {item.ruc && (
                                                                <div className="text-xs text-muted-foreground">RUC: {item.ruc}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatCurrency(item.produccion_actual)}
                                                        </span>
                                                        <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                                                            Nuevo
                                                        </Badge>
                                                    </div>
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
                                        Clientes que aparecieron en {data.resumen?.periodo_anterior || 'período anterior'} pero no en {data.resumen?.periodo_actual || 'período actual'}
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    {!data.clientes_inactivos || data.clientes_inactivos.length === 0 ? (
                                        <div className="text-center py-6 text-muted-foreground">
                                            No hay clientes inactivos en este período
                                        </div>
                                    ) : (
                                        <ul className="space-y-3">
                                            {data.clientes_inactivos.slice(0, 5).map((item, index) => (
                                                <li key={item.cliente_id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 border border-gray-200">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                                                        <div>
                                                            <span className="font-medium">{item.cliente}</span>
                                                            {item.ruc && (
                                                                <div className="text-xs text-muted-foreground">RUC: {item.ruc}</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm text-muted-foreground">
                                                            {formatCurrency(item.produccion_anterior)}
                                                        </span>
                                                        <Badge variant="outline" className="text-gray-600 border-gray-300 text-xs">
                                                            Inactivo
                                                        </Badge>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case 'distribucion':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-purple-500" />
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
                                    <ResponsiveContainer width="100%" height={350}>
                                        <RePieChart>
                                            <Pie
                                                data={distribucion}
                                                dataKey="porcentaje"
                                                nameKey="cliente"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={110}
                                                innerRadius={65}
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
                                        </RePieChart>
                                    </ResponsiveContainer>

                                    <div className="overflow-auto max-h-[350px]">
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
                );

            case 'prediccion':
                return (
                    <PrediccionIA
                        onPrediccionGenerada={(data) => {
                            console.log('Predicción generada:', data);
                        }}
                    />
                );
            default:
                return null;
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-14 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
                <Skeleton className="h-12 w-full" />
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

    return (
        <div className="space-y-6">
            {/* Modal de error */}
            <Dialog open={modalAbierto} onOpenChange={setModalAbierto}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="h-5 w-5" />
                            Error en el período seleccionado
                        </DialogTitle>
                        <DialogDescription className="text-red-500/80 pt-2">
                            {errorValidacion}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {tipoError === "rango" && (
                            <Button variant="outline" size="sm" onClick={ajustarRango} className="gap-1">
                                <Calendar className="h-4 w-4" />
                                Ajustar a 24 meses
                            </Button>
                        )}
                        {tipoError === "future" && (
                            <>
                                <Button variant="outline" size="sm" onClick={retrocederMes} className="gap-1">
                                    <ChevronLeft className="h-4 w-4" />
                                    Retroceder un mes
                                </Button>
                                <Button variant="outline" size="sm" onClick={resetFechas} className="gap-1">
                                    <Undo2 className="h-4 w-4" />
                                    Restablecer
                                </Button>
                            </>
                        )}
                        {tipoError === "orden" && (
                            <Button variant="outline" size="sm" onClick={intercambiarFechas} className="gap-1">
                                <RefreshCw className="h-4 w-4" />
                                Intercambiar fechas
                            </Button>
                        )}
                        {tipoError !== "rango" && (
                            <Button variant="outline" size="sm" onClick={resetFechas} className="gap-1">
                                <Undo2 className="h-4 w-4" />
                                Restablecer
                            </Button>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setModalAbierto(false)}>
                            Cerrar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Filtro de rango de fechas */}
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
                                    value={fechaInicioInput}
                                    onChange={(e) => setFechaInicioInput(e.target.value)}
                                    className="w-40"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Label htmlFor="fechaFin" className="text-sm">Hasta:</Label>
                                <Input
                                    id="fechaFin"
                                    type="date"
                                    value={fechaFinInput}
                                    onChange={(e) => setFechaFinInput(e.target.value)}
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

            {/* Barra de navegación - Navbar de herramientas */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100/80 rounded-lg border border-slate-200/60">
                    {SECCIONES.map((seccion) => (
                        <Button
                            key={seccion.id}
                            variant="ghost"
                            size="sm"
                            onClick={() => setSeccionActiva(seccion.id)}
                            className={cn(
                                "gap-1.5 h-8 px-3 text-sm font-medium",
                                "hover:bg-white/80 hover:text-slate-800",
                                "transition-all duration-200",
                                seccionActiva === seccion.id
                                    ? "bg-white text-slate-800 shadow-sm border border-slate-200/60"
                                    : "text-slate-500"
                            )}
                        >
                            {seccion.icon}
                            {seccion.label}
                        </Button>
                    ))}
                    <div className="flex-1" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 h-8 px-2 text-xs text-slate-400 hover:text-slate-600"
                    >
                        <Download className="h-3.5 w-3.5" />
                        Exportar
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 h-8 px-2 text-xs text-slate-400 hover:text-slate-600"
                    >
                        <Share2 className="h-3.5 w-3.5" />
                        Compartir
                    </Button>
                </div>

                {/* Descripción de la sección activa */}
                <div className="flex items-center gap-2 px-1">
                    <span className="text-xs text-muted-foreground">
                        {SECCIONES.find(s => s.id === seccionActiva)?.descripcion}
                    </span>
                </div>
            </div>

            {/* Contenido según sección activa */}
            {renderContenido()}
        </div>
    );
}