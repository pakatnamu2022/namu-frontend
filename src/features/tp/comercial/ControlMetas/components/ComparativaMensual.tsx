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
import { Calendar, TrendingUp, TrendingDown, AlertCircle, RefreshCw, DollarSign, LayoutDashboard, Users, Download, Share2 } from "lucide-react";
import { useComparativaMensual, useAvailableYearsGoalTravel, useExportComparativaClientes } from "../lib/GoalTravelControl.hook";
import { MONTHS } from "../lib/GoalTravelControl.constants";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { errorToast } from "@/core/core.function";

type SeccionComparativa = 'resumen' | 'clientes' | 'variacion' | 'detalle';

interface Seccion {
    id: SeccionComparativa;
    label: string;
    icon: React.ReactNode;
    descripcion: string;
}

const SECCIONES: Seccion[] = [
    {
        id: 'resumen',
        label: 'Resumen',
        icon: <LayoutDashboard className="h-4 w-4" />,
        descripcion: 'Vista general de la comparativa'
    },
    {
        id: 'clientes',
        label: 'Clientes',
        icon: <Users className="h-4 w-4" />,
        descripcion: 'Comparativa por cliente'
    },
    {
        id: 'variacion',
        label: 'Variación',
        icon: <TrendingUp className="h-4 w-4" />,
        descripcion: 'Análisis de variación'
    },
    {
        id: 'detalle',
        label: 'Detalle',
        icon: <DollarSign className="h-4 w-4" />,
        descripcion: 'Detalle por cliente'
    }
];

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
    const [seccionActiva, setSeccionActiva] = useState<SeccionComparativa>('resumen');
    const [compararPersonalizado, setCompararPersonalizado] = useState<boolean>(false);
    const [errorMensaje, setErrorMensaje] = useState<string | null>(null);
    const [tipoError, setTipoError] = useState<"future" | "igual" | null>(null);

    const { data, isLoading, error } = useComparativaMensual(
        year1,
        month1,
        compararPersonalizado ? year2 : undefined,
        compararPersonalizado ? month2 : undefined
    );
    const getYear2 = () => {
        if (compararPersonalizado) {
            return year2;
        }
        // Si no es personalizado, calcular el mes anterior
        const mesAnterior = month1 - 1;
        const anioAnterior = mesAnterior === 0 ? year1 - 1 : year1;
        return anioAnterior;
    };

    const getMonth2 = () => {
        if (compararPersonalizado) {
            return month2;
        }
        // Si no es personalizado, calcular el mes anterior
        const mesAnterior = month1 - 1;
        return mesAnterior === 0 ? 12 : mesAnterior;
    };
    const { data: availableYears = [] } = useAvailableYearsGoalTravel();
    const { mutate: exportComparativa, isPending: isExporting } = useExportComparativaClientes(
        year1,
        month1,
        getYear2(),
        getMonth2()
    );



    // Validar fechas al cambiar
    useEffect(() => {
        validarFechas();
    }, [year1, month1, year2, month2, compararPersonalizado]);


    const handleExportComparativa = () => {
        if (!data || data.clientes.length === 0) {
            errorToast('No hay datos para exportar');
            return;
        }
        exportComparativa();
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

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
            <div className="space-y-6">
                <Skeleton className="h-14 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full" />
                    ))}
                </div>
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
                <CardContent className="text-center py-12 text-red-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3" />
                    <p className="font-medium">Error al cargar la comparativa</p>
                    <p className="text-sm text-red-500/70 mt-1">{(error as Error).message}</p>
                </CardContent>
            </Card>
        );
    }

    // Error de validación (fechas futuras, períodos iguales)
    if (errorMensaje) {
        return (
            <Card className="border-red-200 bg-red-50">
                <CardContent className="py-12">
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
                <CardContent className="text-center py-12 text-muted-foreground">
                    <p>No hay datos disponibles para el período seleccionado</p>
                </CardContent>
            </Card>
        );
    }

    const varViajes = data?.resumen?.actual?.viajes - data?.resumen?.anterior?.viajes || 0;
    const varProduccion = data?.resumen?.actual?.produccion - data?.resumen?.anterior?.produccion || 0;
    const pctViajes = data?.resumen?.anterior?.viajes > 0 ? (varViajes / data.resumen.anterior.viajes) * 100 : 0;
    const pctProduccion = data?.resumen?.anterior?.produccion > 0 ? (varProduccion / data.resumen.anterior.produccion) * 100 : 0;
    const renderContenido = () => {
        if (!data) return null;

        switch (seccionActiva) {
            case 'resumen':
                return (
                    <div className="space-y-6">
                        {/* Tarjetas de resumen */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {data.resumen.actual.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold">{data.resumen.actual.viajes} viajes</p>
                                            <p className="text-lg font-semibold text-green-600">
                                                {formatCurrency(data.resumen.actual.produccion)}
                                            </p>
                                        </div>
                                        <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Calendar className="h-6 w-6 text-blue-500" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className={cn(
                                "border-l-4 shadow-sm hover:shadow-md transition-shadow",
                                compararPersonalizado ? "border-l-orange-500" : "border-l-purple-500"
                            )}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm font-medium text-muted-foreground">
                                        {data.resumen.anterior.label}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold">{data.resumen.anterior.viajes} viajes</p>
                                            <p className="text-lg font-semibold text-blue-600">
                                                {formatCurrency(data.resumen.anterior.produccion)}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            "h-12 w-12 rounded-full flex items-center justify-center",
                                            compararPersonalizado ? "bg-orange-100" : "bg-purple-100"
                                        )}>
                                            <Calendar className={cn(
                                                "h-6 w-6",
                                                compararPersonalizado ? "text-orange-500" : "text-purple-500"
                                            )} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Métricas de variación */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Resumen de Variación</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Viajes</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-lg font-bold ${varViajes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {varViajes >= 0 ? '+' : ''}{varViajes}
                                                </span>
                                                <Badge variant={varViajes >= 0 ? 'default' : 'outline'}>
                                                    {pctViajes >= 0 ? '+' : ''}{pctViajes.toFixed(1)}%
                                                </Badge>
                                                {varViajes >= 0 ?
                                                    <TrendingUp className="h-4 w-4 text-green-600" /> :
                                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                                }
                                            </div>
                                        </div>
                                        <Progress
                                            value={Math.min(Math.abs(pctViajes), 100)}
                                            className="h-2"
                                            indicatorClassName={pctViajes >= 0 ? "bg-green-500" : "bg-red-500"}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">Producción</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-lg font-bold ${varProduccion >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {varProduccion >= 0 ? '+' : ''}{formatCurrency(varProduccion)}
                                                </span>
                                                <Badge variant={varProduccion >= 0 ? 'default' : 'outline'}>
                                                    {pctProduccion >= 0 ? '+' : ''}{pctProduccion.toFixed(1)}%
                                                </Badge>
                                                {varProduccion >= 0 ?
                                                    <TrendingUp className="h-4 w-4 text-green-600" /> :
                                                    <TrendingDown className="h-4 w-4 text-red-600" />
                                                }
                                            </div>
                                        </div>
                                        <Progress
                                            value={Math.min(Math.abs(pctProduccion), 100)}
                                            className="h-2"
                                            indicatorClassName={pctProduccion >= 0 ? "bg-green-500" : "bg-red-500"}
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Información adicional */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Información del Período</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Período 1</p>
                                        <p className="font-medium">{data.periodo_actual.label}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Período 2</p>
                                        <p className="font-medium">{data.periodo_anterior.label}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Clientes Activos</p>
                                        <p className="font-medium">{data.clientes.length}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Comparación</p>
                                        <Badge variant="outline">
                                            {compararPersonalizado ? 'Personalizada' : 'Mes a Mes'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                );

            case 'clientes':
                const maxViajes = Math.max(...data.viajes_actual, ...data.viajes_anterior);
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Comparativa por Cliente
                                <Badge variant="outline" className="ml-2">
                                    {data.clientes.length} clientes
                                </Badge>
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
                                        const prodActual = formatCurrency(data.produccion_actual[index] || 0);
                                        const prodAnterior = formatCurrency(data.produccion_anterior[index] || 0);
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
                                                            {viajesActual} v
                                                            <span className="text-[10px] bg-blue-100 text-blue-700 px-1 rounded">
                                                                {pctActual}%
                                                            </span>
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className={cn("w-2 h-2 rounded-full", compararPersonalizado ? "bg-orange-400" : "bg-purple-500")}></span>
                                                            {viajesAnterior} v
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
                                                        title={`${cliente} (Actual): ${viajesActual} viajes, ${prodActual}`}
                                                    />
                                                    <div
                                                        className={cn("h-full rounded-r transition-all duration-500 hover:opacity-80", compararPersonalizado ? "bg-orange-400" : "bg-purple-500")}
                                                        style={{ width: `${porcentajeAnterior}%` }}
                                                        title={`${cliente} (Anterior): ${viajesAnterior} viajes, ${prodAnterior}`}
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
                );

            case 'variacion':
                // Calcular top clientes con mayor crecimiento y decrecimiento
                const clientesConVariacion = data.clientes.map((cliente, index) => ({
                    cliente,
                    viajesActual: data.viajes_actual[index] || 0,
                    viajesAnterior: data.viajes_anterior[index] || 0,
                    produccionActual: data.produccion_actual[index] || 0,
                    produccionAnterior: data.produccion_anterior[index] || 0,
                    diffViajes: (data.viajes_actual[index] || 0) - (data.viajes_anterior[index] || 0),
                    pctViajes: (data.viajes_anterior[index] || 0) > 0
                        ? (((data.viajes_actual[index] || 0) - (data.viajes_anterior[index] || 0)) / (data.viajes_anterior[index] || 0)) * 100
                        : 0
                }));

                const topCrecimiento = [...clientesConVariacion]
                    .sort((a, b) => b.diffViajes - a.diffViajes)
                    .slice(0, 10)
                    .filter(c => c.diffViajes > 0);

                const topDecrecimiento = [...clientesConVariacion]
                    .sort((a, b) => a.diffViajes - b.diffViajes)
                    .slice(0, 10)
                    .filter(c => c.diffViajes < 0);

                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Top Crecimiento */}
                            <Card className="border-l-4 border-l-green-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-green-700">
                                        <TrendingUp className="h-5 w-5" />
                                        Mayor Crecimiento
                                        <Badge variant="outline" className="ml-2 text-green-600 border-green-300">
                                            {topCrecimiento.length} clientes
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {topCrecimiento.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">
                                            No hay clientes con crecimiento
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {topCrecimiento.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 border-b">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <span className="text-sm font-medium text-muted-foreground w-8">
                                                            #{index + 1}
                                                        </span>
                                                        <span className="font-medium truncate">{item.cliente}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm flex-shrink-0">
                                                        <span className="text-muted-foreground hidden sm:inline">
                                                            {item.viajesAnterior} → {item.viajesActual}
                                                        </span>
                                                        <Badge className="bg-green-100 text-green-700 border-green-200">
                                                            +{item.diffViajes} ({item.pctViajes.toFixed(1)}%)
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Top Decrecimiento */}
                            <Card className="border-l-4 border-l-red-500">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-red-700">
                                        <TrendingDown className="h-5 w-5" />
                                        Mayor Decrecimiento
                                        <Badge variant="outline" className="ml-2 text-red-600 border-red-300">
                                            {topDecrecimiento.length} clientes
                                        </Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {topDecrecimiento.length === 0 ? (
                                        <p className="text-center text-muted-foreground py-4">
                                            No hay clientes con decrecimiento
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {topDecrecimiento.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 border-b">
                                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                                        <span className="text-sm font-medium text-muted-foreground w-8">
                                                            #{index + 1}
                                                        </span>
                                                        <span className="font-medium truncate">{item.cliente}</span>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm flex-shrink-0">
                                                        <span className="text-muted-foreground hidden sm:inline">
                                                            {item.viajesAnterior} → {item.viajesActual}
                                                        </span>
                                                        <Badge className="bg-red-100 text-red-700 border-red-200">
                                                            {item.diffViajes} ({item.pctViajes.toFixed(1)}%)
                                                        </Badge>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                );

            case 'detalle':
                return (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5" />
                                Detalle por Cliente
                                <Badge variant="outline" className="ml-2">
                                    {data.clientes.length} clientes
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b bg-muted/30">
                                            <th className="text-left py-2 font-medium">Cliente</th>
                                            <th className="text-center py-2 font-medium" colSpan={2}>Viajes</th>
                                            <th className="text-center py-2 font-medium" colSpan={2}>Producción</th>
                                            <th className="text-center py-2 font-medium">Variación</th>
                                            <th className="text-center py-2 font-medium">Estado</th>
                                        </tr>
                                        <tr className="border-b text-xs text-muted-foreground">
                                            <th></th>
                                            <th className="text-center">Actual</th>
                                            <th className="text-center">Anterior</th>
                                            <th className="text-center">Actual</th>
                                            <th className="text-center">Anterior</th>
                                            <th className="text-center">%</th>
                                            <th className="text-center"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.clientes.map((cliente, index) => {
                                            const vAct = data.viajes_actual[index] || 0;
                                            const vAnt = data.viajes_anterior[index] || 0;
                                            const pAct = formatCurrency(data.produccion_actual[index] || 0);
                                            const pAnt = formatCurrency(data.produccion_anterior[index] || 0);
                                            const diffV = vAct - vAnt;
                                            const pctV = vAnt > 0 ? (diffV / vAnt) * 100 : 0;

                                            const estado = diffV > 0 ? 'Crece' : diffV < 0 ? 'Decrece' : 'Estable';

                                            return (
                                                <tr key={index} className="border-b hover:bg-muted/50 transition-colors">
                                                    <td className="py-2 font-medium">{cliente}</td>
                                                    <td className="text-center">{vAct}</td>
                                                    <td className="text-center text-muted-foreground">{vAnt}</td>
                                                    <td className="text-center font-medium">{pAct}</td>
                                                    <td className="text-center text-muted-foreground">{pAnt}</td>
                                                    <td className={`text-center font-medium ${diffV > 0 ? 'text-green-600' : diffV < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                                        {diffV !== 0 ? `${diffV > 0 ? '+' : ''}${diffV} (${pctV > 0 ? '+' : ''}${pctV.toFixed(1)}%)` : '-'}
                                                    </td>
                                                    <td className="text-center">
                                                        <Badge
                                                            className={
                                                                diffV > 0 ? 'bg-green-100 text-green-700 border-green-200' :
                                                                    diffV < 0 ? 'bg-red-100 text-red-700 border-red-200' :
                                                                        'bg-gray-100 text-gray-700 border-gray-200'
                                                            }
                                                        >
                                                            {estado}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                );

            default:
                return null;
        }
    };


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

                        <div className="flex flex-wrap items-center gap-2 text-sm bg-muted/30 p-2 rounded-lg">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Comparando:</span>
                            <span className="text-foreground">
                                {data.periodo_actual.label} vs {data.periodo_anterior.label}
                            </span>
                            {compararPersonalizado ? (
                                <Badge variant="outline" className="ml-2 text-xs">
                                    Personalizado
                                </Badge>
                            ) : (
                                <Badge variant="outline" className="ml-2 text-xs">
                                    Mes a Mes
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Barra de navegación */}
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
                        onClick={handleExportComparativa}
                        disabled={isExporting || !data || data.clientes.length === 0}
                        className="gap-1.5 h-8 px-2 text-xs text-slate-400 hover:text-slate-600"
                    >
                        <Download className="h-3.5 w-3.5" />
                        {isExporting ? 'Exportando...' : 'Exportar'}
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