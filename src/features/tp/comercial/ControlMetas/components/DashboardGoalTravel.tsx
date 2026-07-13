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
import { Calendar, Users, Truck, TrendingUp, LayoutDashboard, PieChart, Download, Share2 } from "lucide-react";
import {
    useDashboardGoalTravelControl,
    useAvailableYearsGoalTravel,
} from "../lib/GoalTravelControl.hook";
import { MONTHS } from "../lib/GoalTravelControl.constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
type SeccionDashboard = 'resumen' | 'conductores' | 'vehiculos' | 'distribucion';

interface Seccion {
    id: SeccionDashboard;
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
        id: 'conductores',
        label: 'Conductores',
        icon: <Users className="h-4 w-4" />,
        descripcion: 'Cumplimiento por conductor'
    },
    {
        id: 'vehiculos',
        label: 'Vehículos',
        icon: <Truck className="h-4 w-4" />,
        descripcion: 'Cumplimiento por vehículo'
    },
    {
        id: 'distribucion',
        label: 'Distribución',
        icon: <PieChart className="h-4 w-4" />,
        descripcion: 'Análisis de distribución'
    }
];
export default function DashboardGoalTravel() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const [seccionActiva, setSeccionActiva] = useState<SeccionDashboard>('resumen');
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
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };
    const renderContenido = () => {
        if (!data) return null;

        switch (seccionActiva) {
            case 'resumen':
                return (
                    <>
                        {/* Resumen General */}
                        {data.resumen && (
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Producción Total */}
                                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-muted-foreground">Producción Total</p>
                                                <p className="text-2xl font-bold mt-1">
                                                    {formatCurrency(Number(data.resumen.produccion_total)) || "0.00"}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                                    <Badge variant="outline" className="text-xs">
                                                        Meta: {formatCurrency(Number(data.meta?.total)) || "0.00"}
                                                    </Badge>
                                                    <Badge className={cn("text-xs", getStatusColor(data.resumen.porcentaje_cumplimiento || 0))}>
                                                        {Number(data.resumen.porcentaje_cumplimiento) || 0}%
                                                    </Badge>
                                                </div>
                                                <Progress
                                                    value={Math.min(Number(data.resumen.porcentaje_cumplimiento) || 0, 100)}
                                                    className="mt-2 h-1.5"
                                                    indicatorClassName={getProgressColor(Number(data.resumen.porcentaje_cumplimiento) || 0)}
                                                />
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 ml-3">
                                                <TrendingUp className="h-6 w-6 text-blue-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Viajes Realizados */}
                                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">Viajes Realizados</p>
                                                <p className="text-2xl font-bold mt-1">{data.resumen.total_viajes || 0}</p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                                <Calendar className="h-6 w-6 text-green-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Conductores Activos */}
                                <Card className="border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    <Users className="h-4 w-4 inline mr-1" />
                                                    Conductores Activos
                                                </p>
                                                <p className="text-2xl font-bold mt-1">{data.resumen.conductores_activos || 0}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Meta: {data.meta?.total_unidades || 0} unidades
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                                                <Users className="h-6 w-6 text-purple-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Vehículos Activos */}
                                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    <Truck className="h-4 w-4 inline mr-1" />
                                                    Vehículos Activos
                                                </p>
                                                <p className="text-2xl font-bold mt-1">{data.resumen.vehiculos_activos || 0}</p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    Meta: {data.meta?.total_unidades || 0} vehículos
                                                </p>
                                            </div>
                                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                                <Truck className="h-6 w-6 text-amber-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}

                        {/* Tarjeta de métricas adicionales */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Información del Período</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Mes</p>
                                        <p className="font-medium">{MONTHS.find((m) => m.value === month.toString())?.label}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Año</p>
                                        <p className="font-medium">{year}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Meta Total</p>
                                        <p className="font-medium">{formatCurrency(Number(data.meta?.total)) || "0.00"}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Unidades Meta</p>
                                        <p className="font-medium">{data.meta?.total_unidades || 0}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Produccion Total</p>
                                        <p className="font-medium">{formatCurrency(Number(data.resumen?.produccion_total)) || "0.00"}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </>
                );

            case 'conductores':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Cumplimiento por Conductor
                                <Badge variant="outline" className="ml-2">
                                    {data.resumen?.conductores_activos} conductores
                                </Badge>
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Meta por conductor: {formatCurrency(Number(data.meta?.meta_conductor || 0))}
                            </div>
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
                                                    {formatCurrency(Number(conductor.produccion_real)) || "0.00"}
                                                </td>
                                                <td className="text-right py-2">
                                                    {formatCurrency(Number(conductor.meta_conductor)) || "0.00"}
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
                );

            case 'vehiculos':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Truck className="h-5 w-5" />
                                Cumplimiento por Vehículo
                                <Badge variant="outline" className="ml-2">
                                    {data.resumen?.vehiculos_activos || 0} vehículos
                                </Badge>
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Meta por vehículo: {formatCurrency(Number(data.meta?.meta_vehiculo || 0))}
                            </div>
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
                                                    {formatCurrency(Number(vehiculo.produccion_real)) || "0.00"}
                                                </td>
                                                <td className="text-right py-2">
                                                    {formatCurrency(Number(vehiculo.meta_vehiculo)) || "0.00"}
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
                );

            case 'distribucion':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-purple-500" />
                                Distribución de Producción
                            </CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Análisis de distribución por conductores y vehículos
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Gráfico de distribución - Conductores */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3">Top Conductores</h4>
                                    <div className="space-y-2">
                                        {data.conductores.slice(0, 5).map((conductor, index) => (
                                            <div key={conductor.conductor_id} className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground w-6">#{index + 1}</span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="truncate">{conductor.conductor}</span>
                                                        <span className="font-medium">{conductor.porcentaje_cumplimiento || 0}%</span>
                                                    </div>
                                                    <Progress
                                                        value={Math.min(conductor.porcentaje_cumplimiento || 0, 100)}
                                                        className="h-1.5"
                                                        indicatorClassName={getProgressColor(conductor.porcentaje_cumplimiento || 0)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {data.conductores.length === 0 && (
                                            <p className="text-center text-muted-foreground text-sm">No hay datos</p>
                                        )}
                                    </div>
                                </div>

                                {/* Gráfico de distribución - Vehículos */}
                                <div>
                                    <h4 className="text-sm font-medium mb-3">Top Vehículos</h4>
                                    <div className="space-y-2">
                                        {data.vehiculos.slice(0, 5).map((vehiculo, index) => (
                                            <div key={vehiculo.vehiculo_id} className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground w-6">#{index + 1}</span>
                                                <div className="flex-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="truncate">{vehiculo.vehiculo}</span>
                                                        <span className="font-medium">{vehiculo.porcentaje_cumplimiento || 0}%</span>
                                                    </div>
                                                    <Progress
                                                        value={Math.min(vehiculo.porcentaje_cumplimiento || 0, 100)}
                                                        className="h-1.5"
                                                        indicatorClassName={getProgressColor(vehiculo.porcentaje_cumplimiento || 0)}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                        {data.vehiculos.length === 0 && (
                                            <p className="text-center text-muted-foreground text-sm">No hay datos</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Resumen de distribución */}
                            <div className="mt-6 pt-4 border-t">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Total Conductores</p>
                                        <p className="font-semibold">{data.resumen?.conductores_activos}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Total Vehículos</p>
                                        <p className="font-semibold">{data.resumen?.vehiculos_activos}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Producción Promedio Conductor</p>
                                        <p className="font-semibold">
                                            {data.conductores.length > 0
                                                ? formatCurrency(data.conductores.reduce((acc, c) => acc + Number(c.produccion_real), 0) / data.conductores.length)
                                                : formatCurrency(0)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Producción Promedio Vehículo</p>
                                        <p className="font-semibold">
                                            {data.vehiculos.length > 0
                                                ? formatCurrency(data.vehiculos.reduce((acc, v) => acc + Number(v.produccion_real), 0) / data.vehiculos.length)
                                                : formatCurrency(0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
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
            <div className="flex flex-wrap items-center gap-4">
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