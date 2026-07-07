"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertCircle, Users, DollarSign, Calendar, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
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

// Colores para el gráfico de Pareto
const COLORS = ["#3b82f6", "#60a5fa", "#93bbfc", "#bfdbfe", "#dbeafe", "#e5e7eb", "#f3f4f6"];

export default function AnalisisEstrategico() {
    const { data, isLoading, error } = useAnalisisEstrategico();
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
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
                    <p>No hay datos disponibles</p>
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
                            Día {proyeccion.dias_transcurridos} de {proyeccion.dias_totales}
                        </div>
                    </CardContent>
                </Card>

                {/* <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Target className="h-4 w-4" />
                            Proyección de Cierre
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {formatCurrency(Number(proyeccion.proyeccion.toFixed(2)))}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Meta: {formatCurrency(Number(proyeccion.meta.toFixed(2)))}
                        </div>
                    </CardContent>
                </Card> */}

                <Card className={cn("border-l-4", getStatusColor(proyeccion.cumplimiento))}>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Mes Actual
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {new Date().toLocaleString('es-ES', { month: 'long', year: 'numeric' })}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            {tendencia.length > 0 ? tendencia[tendencia.length - 1]?.periodo : '-'}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de tendencia */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-blue-500" />
                        Tendencia de Producción (Últimos 6 meses)
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Meta vs Real · Línea muestra % de cumplimiento
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
                    </CardHeader>
                    <CardContent>
                        {top_crecimiento.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                No hay clientes con crecimiento este mes
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
                    </CardHeader>
                    <CardContent>
                        {top_decrecimiento.length === 0 ? (
                            <div className="text-center py-6 text-muted-foreground">
                                No hay clientes con decrecimiento este mes
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
                                                S/. {formatCurrency(Number(item.anterior.toFixed(2)))} → S/. {formatCurrency(Number(item.actual.toFixed(2)))}
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

            {/* Distribución por cliente (Pareto) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-purple-500" />
                        Distribución de Producción por Cliente (Pareto)
                    </CardTitle>
                    <div className="text-sm text-muted-foreground">
                        Muestra el % de participación de cada cliente en la producción total
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