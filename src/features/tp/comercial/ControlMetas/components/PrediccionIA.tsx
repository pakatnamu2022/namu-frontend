"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Brain,
    AlertCircle,
    CheckCircle,
    Sparkles,
    Zap,
    Target,
    BarChart3,
    Activity,
    Calendar,
    ArrowUp,
    ArrowDown,
    Gauge,
    LineChart,
    Settings2,
    ChevronDown,
    ChevronUp,
    Briefcase
} from "lucide-react";
import {
    ComposedChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    ReferenceLine,
    Area
} from "recharts";
import { usePrediccionIA } from "../lib/GoalTravelControl.hook";
import { cn } from "@/lib/utils";

interface PrediccionIAProps {
    onPrediccionGenerada?: (data: any) => void;
    className?: string;
}

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-PE', {
        style: 'currency',
        currency: 'PEN',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(value);
};

export function PrediccionIA({ onPrediccionGenerada, className }: PrediccionIAProps) {
    const [mesesHistoricos, setMesesHistoricos] = useState(12);
    const [factorConfianza, setFactorConfianza] = useState(1.0);
    const [generar, setGenerar] = useState(false);
    const [mostrarControles, setMostrarControles] = useState(false);
    const [activeTab, setActiveTab] = useState("prediccion");

    const { data, isLoading, error, refetch, isFetching } = usePrediccionIA(
        mesesHistoricos,
        factorConfianza,
        generar
    );

    useEffect(() => {
        if (data && !isFetching) {
            setGenerar(false);
            if (onPrediccionGenerada) {
                onPrediccionGenerada(data);
            }
        }
    }, [data, isFetching, onPrediccionGenerada]);

    const handleGenerarPrediccion = () => {
        setGenerar(true);
        refetch();
    };

    const getNivelConfianzaColor = (nivel: string) => {
        switch (nivel) {
            case 'alto': return 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60';
            case 'medio': return 'bg-amber-50/80 text-amber-700 border-amber-200/60';
            default: return 'bg-rose-50/80 text-rose-700 border-rose-200/60';
        }
    };

    const getNivelConfianzaIcon = (nivel: string) => {
        switch (nivel) {
            case 'alto': return <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />;
            case 'medio': return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />;
            default: return <AlertCircle className="h-3.5 w-3.5 text-rose-500" />;
        }
    };

    const getTendenciaIcon = (tendencia: string) => {
        if (tendencia === 'creciente') {
            return <ArrowUp className="h-3.5 w-3.5 text-emerald-500" />;
        }
        return <ArrowDown className="h-3.5 w-3.5 text-rose-500" />;
    };

    if (isLoading) {
        return (
            <Card className={cn("border border-slate-200/60 shadow-sm bg-white", className)}>
                <CardContent className="pt-8">
                    <div className="flex items-center justify-center py-8">
                        <div className="space-y-4 text-center">
                            <div className="relative">
                                <div className="h-12 w-12 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                                    <Brain className="h-5 w-5 text-slate-400 animate-pulse" />
                                </div>
                                <div className="absolute -top-1 -right-1 h-3 w-3">
                                    <div className="animate-spin h-3 w-3 border-2 border-slate-400 border-t-transparent rounded-full" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">Analizando datos</p>
                                <p className="text-xs text-slate-400">Procesando información histórica</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className={cn(
            "border border-slate-200/60 shadow-sm bg-white overflow-hidden",
            "transition-shadow duration-300 hover:shadow-md",
            className
        )}>
            {/* Header - Estilo Corporativo */}
            <div className="border-b border-slate-200/60 bg-slate-50/50 px-6 py-4">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center border border-slate-200/60">
                            <Brain className="h-4 w-4 text-slate-600" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-semibold text-slate-800">Predicción de Cumplimiento</h3>
                                <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-medium bg-slate-100 text-slate-600 border-slate-200">
                                    <Sparkles className="h-2.5 w-2.5 mr-1" />
                                    Beta
                                </Badge>
                            </div>
                            <p className="text-xs text-slate-500">Modelo predictivo · Regresión ponderada</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setMostrarControles(!mostrarControles)}
                        className="h-7 px-3 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    >
                        <Settings2 className="h-3.5 w-3.5 mr-1.5" />
                        {mostrarControles ? 'Ocultar parámetros' : 'Parámetros'}
                        {mostrarControles ? (
                            <ChevronUp className="h-3.5 w-3.5 ml-1" />
                        ) : (
                            <ChevronDown className="h-3.5 w-3.5 ml-1" />
                        )}
                    </Button>
                </div>
            </div>

            <CardContent className="p-6 space-y-5">
                {/* Controles Avanzados */}
                {mostrarControles && (
                    <div className="bg-slate-50/70 rounded-lg p-4 border border-slate-200/60">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                        Ventana histórica
                                    </label>
                                    <Badge variant="outline" className="h-5 px-2 text-[10px] bg-white">
                                        {mesesHistoricos} meses
                                    </Badge>
                                </div>
                                <Slider
                                    min={3}
                                    max={36}
                                    step={1}
                                    value={[mesesHistoricos]}
                                    onValueChange={([value]) => setMesesHistoricos(value)}
                                    className="w-full [&_[role=slider]]:bg-slate-700"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>3 meses</span>
                                    <span className="text-slate-500 font-medium">
                                        {mesesHistoricos >= 24 ? 'Recomendado' : mesesHistoricos >= 12 ? 'Estándar' : 'Básico'}
                                    </span>
                                    <span>36 meses</span>
                                </div>
                            </div>

                            <div className="space-y-2.5">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                        <Gauge className="h-3.5 w-3.5 text-slate-400" />
                                        Factor de confianza
                                    </label>
                                    <Badge variant="outline" className="h-5 px-2 text-[10px] bg-white">
                                        {factorConfianza.toFixed(2)}x
                                    </Badge>
                                </div>
                                <Slider
                                    min={0.8}
                                    max={1.2}
                                    step={0.05}
                                    value={[factorConfianza]}
                                    onValueChange={([value]) => setFactorConfianza(value)}
                                    className="w-full [&_[role=slider]]:bg-slate-700"
                                />
                                <div className="flex justify-between text-[10px] text-slate-400">
                                    <span>Conservador</span>
                                    <span className="text-slate-500 font-medium">
                                        {factorConfianza === 1 ? 'Equilibrado' : factorConfianza > 1 ? 'Agresivo' : 'Cauteloso'}
                                    </span>
                                    <span>Agresivo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Botón Generar */}
                <Button
                    onClick={handleGenerarPrediccion}
                    className={cn(
                        "w-full gap-2 h-10 text-sm font-medium",
                        "bg-slate-800 hover:bg-slate-700",
                        "transition-all duration-200",
                        "disabled:opacity-60 disabled:cursor-not-allowed"
                    )}
                    disabled={isFetching}
                >
                    {isFetching ? (
                        <>
                            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                            Procesando...
                        </>
                    ) : (
                        <>
                            <Brain className="h-4 w-4" />
                            {data ? 'Actualizar predicción' : 'Generar predicción'}
                        </>
                    )}
                </Button>

                {/* Resultados */}
                {data?.success && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 bg-slate-100/60 p-0.5 rounded-lg h-8">
                                <TabsTrigger
                                    value="prediccion"
                                    className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md gap-1.5 h-7"
                                >
                                    <LineChart className="h-3.5 w-3.5" />
                                    Predicción
                                </TabsTrigger>
                                <TabsTrigger
                                    value="analisis"
                                    className="text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md gap-1.5 h-7"
                                >
                                    <Activity className="h-3.5 w-3.5" />
                                    Análisis
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="prediccion" className="space-y-5 mt-4">
                                {/* Métricas Principales */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <div className="bg-white rounded-lg p-4 border border-slate-200/60">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                                    <Target className="h-3.5 w-3.5 text-slate-400" />
                                                    Cumplimiento
                                                </p>
                                                <p className="text-2xl font-semibold text-slate-800 mt-0.5">
                                                    {data.prediccion.cumplimiento_proyectado}%
                                                </p>
                                            </div>
                                            <Badge className={cn("h-5 px-2 text-[10px] font-medium border", getNivelConfianzaColor(data.prediccion.nivel_confianza))}>
                                                {getNivelConfianzaIcon(data.prediccion.nivel_confianza)}
                                                {data.prediccion.nivel_confianza}
                                            </Badge>
                                        </div>
                                        <div className="mt-2">
                                            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-slate-700 rounded-full transition-all duration-1000"
                                                    style={{ width: `${Math.min(data.prediccion.cumplimiento_proyectado, 100)}%` }}
                                                />
                                            </div>
                                            <p className="text-[10px] text-slate-400 mt-1">
                                                {data.prediccion.cumplimiento_proyectado >= 100 ? '✓ Meta proyectada' : 'En progreso'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-slate-200/60">
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                            <Zap className="h-3.5 w-3.5 text-slate-400" />
                                            Producción estimada
                                        </p>
                                        <p className="text-lg font-semibold text-slate-800 mt-0.5">
                                            {formatCurrency(data.prediccion.produccion_estimada)}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] text-slate-400">Meta:</span>
                                            <span className="text-xs font-medium text-slate-600">
                                                {formatCurrency(data.prediccion.meta_mes_actual)}
                                            </span>
                                            <Badge variant="outline" className="h-5 px-1.5 text-[9px] border-slate-200 text-slate-500 ml-auto">
                                                {data.prediccion.tendencia === 'creciente' ? '↑' : '↓'}
                                                {formatCurrency(Math.abs(data.prediccion.variacion_mensual))}
                                            </Badge>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg p-4 border border-slate-200/60">
                                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                                            <BarChart3 className="h-3.5 w-3.5 text-slate-400" />
                                            Precisión del modelo
                                        </p>
                                        <p className="text-2xl font-semibold text-slate-800 mt-0.5">
                                            {data.prediccion.precision}%
                                        </p>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <span className="text-[10px] text-slate-400">R²:</span>
                                            <span className="text-xs font-medium text-slate-600">{data.prediccion.r2}</span>
                                            <span className="text-[10px] text-slate-400 ml-auto">
                                                {data.prediccion.meses_analizados} meses
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Gráfico */}
                                <div className="bg-white rounded-lg border border-slate-200/60 p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                                            <LineChart className="h-3.5 w-3.5 text-slate-400" />
                                            Tendencia histórica
                                        </h4>
                                        <Badge variant="outline" className="h-5 px-2 text-[9px] bg-slate-50 text-slate-500 border-slate-200">
                                            {data.grafico.length - 1} meses
                                        </Badge>
                                    </div>
                                    <div className="h-60">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <ComposedChart data={data.grafico}>
                                                <defs>
                                                    <linearGradient id="tendenciaGrad" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#475569" stopOpacity={0.15} />
                                                        <stop offset="95%" stopColor="#475569" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100" vertical={false} />
                                                <XAxis
                                                    dataKey="periodo"
                                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                    axisLine={{ stroke: '#e2e8f0' }}
                                                    tickLine={false}
                                                />
                                                <YAxis
                                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                                    axisLine={{ stroke: '#e2e8f0' }}
                                                    tickLine={false}
                                                    tickFormatter={(value) => formatCurrency(value)}
                                                />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: 'white',
                                                        border: '1px solid #e2e8f0',
                                                        borderRadius: '6px',
                                                        padding: '8px 12px',
                                                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                                                        fontSize: '12px'
                                                    }}
                                                    formatter={(value, name) => {
                                                        if (value === null) return ['Sin datos', name];
                                                        if (name === 'Real') return [formatCurrency(Number(value)), 'Histórico'];
                                                        if (name === 'Tendencia') return [formatCurrency(Number(value)), 'Proyección'];
                                                        return [value, name];
                                                    }}
                                                />
                                                <Legend
                                                    wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }}
                                                    iconType="circle"
                                                    iconSize={6}
                                                />
                                                <Bar
                                                    dataKey="real"
                                                    fill="#94a3b8"
                                                    name="Histórico"
                                                    radius={[2, 2, 0, 0]}
                                                    maxBarSize={24}
                                                    opacity={0.7}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="tendencia"
                                                    stroke="#475569"
                                                    strokeWidth={2}
                                                    fill="url(#tendenciaGrad)"
                                                    name="Tendencia"
                                                    dot={{
                                                        stroke: '#475569',
                                                        strokeWidth: 1.5,
                                                        r: 3,
                                                        fill: 'white'
                                                    }}
                                                    activeDot={{ r: 5, stroke: '#475569', strokeWidth: 1.5 }}
                                                />
                                                <ReferenceLine
                                                    x={data.grafico.length - 1}
                                                    stroke="#94a3b8"
                                                    strokeDasharray="4 3"
                                                    label={{
                                                        value: 'Proyección',
                                                        position: 'top',
                                                        fill: '#94a3b8',
                                                        fontSize: 10,
                                                        fontWeight: 500
                                                    }}
                                                />
                                            </ComposedChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="analisis" className="space-y-5 mt-4">
                                {/* Métricas Avanzadas */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                                    <div className="bg-white rounded-lg p-3 border border-slate-200/60">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Tendencia</p>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            {getTendenciaIcon(data.prediccion.tendencia)}
                                            <span className="text-xs font-medium text-slate-700 capitalize">
                                                {data.prediccion.tendencia}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-slate-200/60">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">R²</p>
                                        <p className="text-xs font-medium text-slate-700 mt-1">{data.prediccion.r2}</p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-slate-200/60">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Variación</p>
                                        <p className={cn(
                                            "text-xs font-medium mt-1",
                                            data.prediccion.variacion_mensual > 0 ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {data.prediccion.variacion_mensual > 0 ? '+' : ''}
                                            {formatCurrency(data.prediccion.variacion_mensual)}
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-slate-200/60">
                                        <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Confianza</p>
                                        <p className="text-xs font-medium text-slate-700 mt-1">{data.prediccion.factor_confianza}x</p>
                                    </div>
                                </div>

                                {/* Recomendaciones */}
                                <div className="bg-slate-50/70 rounded-lg p-4 border border-slate-200/60">
                                    <h4 className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-3">
                                        <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                                        Recomendaciones
                                    </h4>
                                    <ul className="space-y-2">
                                        {data.recomendaciones.map((recomendacion: string, index: number) => (
                                            <li
                                                key={index}
                                                className="text-xs flex items-start gap-2.5 p-2 bg-white/80 rounded border border-slate-200/40"
                                            >
                                                <span className="text-slate-400 text-sm leading-none mt-0.5">•</span>
                                                <span className="text-slate-600">{recomendacion}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Modelos */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="bg-white rounded-lg p-3 border border-slate-200/60">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Modelo principal</p>
                                        <p className="text-xs font-medium text-slate-700 mt-1">
                                            {data.prediccion.metodo_principal || 'Regresión Ponderada'}
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            Ponderación exponencial · factor 0.9
                                        </p>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 border border-slate-200/60">
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Modelo secundario</p>
                                        <p className="text-xs font-medium text-slate-700 mt-1">
                                            Suavizamiento Exponencial
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            Alpha 0.3 · 40% del ensemble
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                )}

                {error && (
                    <div className="p-3 bg-rose-50/80 border border-rose-200/60 rounded-lg text-rose-700 flex items-start gap-2.5">
                        <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5 text-rose-500" />
                        <div>
                            <p className="text-xs font-medium">Error</p>
                            <p className="text-xs text-rose-600/80">{(error as Error).message}</p>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}