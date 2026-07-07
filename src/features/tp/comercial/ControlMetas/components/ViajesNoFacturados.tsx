"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Truck, AlertCircle, RefreshCw, TrendingUp, TrendingDown, FileText, Search, Clock, Users } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useViajesNoFacturados, useAvailableYearsGoalTravel } from "../lib/GoalTravelControl.hook";
import { MONTHS } from "../lib/GoalTravelControl.constants";
import { cn } from "@/lib/utils";

export default function ViajesNoFacturados() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number | null>(null); // null = "Todos los meses"
    const [dias, setDias] = useState<number>(4);

    const { data, isLoading, error, refetch } = useViajesNoFacturados(dias, year, month ?? undefined);
    const { data: availableYears = [] } = useAvailableYearsGoalTravel();

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);
    };

    const getTendencia = (produccion: number) => {
        return produccion > 0 ? 'up' : 'down';
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-[120px] w-full rounded-xl" />
                <Skeleton className="h-[400px] w-full rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <Card className="border-red-200 bg-red-50/50">
                <CardContent className="text-center py-12 text-red-600">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-red-500" />
                    <p className="font-medium">Error al cargar viajes no facturados</p>
                    <p className="text-sm text-red-500/70 mt-1">{(error as Error).message}</p>
                </CardContent>
            </Card>
        );
    }

    const totalViajes = data?.resumen?.total_viajes || 0;
    const totalProduccion = data?.resumen?.total_produccion || 0;
    const viajes = data?.data || [];

    return (
        <div className="space-y-6">
            {/* Header con estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-red-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Viajes Pendientes</p>
                                <p className="text-2xl font-bold mt-1">{totalViajes}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                                <AlertCircle className="h-6 w-6 text-red-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Producción Pendiente</p>
                                <p className="text-2xl font-bold mt-1">{formatCurrency(totalProduccion)}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                                <TrendingUp className="h-6 w-6 text-amber-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Clientes Afectados</p>
                                <p className="text-2xl font-bold mt-1">{viajes.length}</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Días de Retraso</p>
                                <p className="text-2xl font-bold mt-1">&gt;{dias} días</p>
                            </div>
                            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-green-500" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Período:</span>
                        </div>
                        <Select
                            value={year.toString()}
                            onValueChange={(value) => setYear(parseInt(value))}
                        >
                            <SelectTrigger className="w-[120px] bg-muted/30 border-0">
                                <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.length > 0 ? (
                                    availableYears.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
                                    ))
                                ) : (
                                    Array.from({ length: 5 }, (_, i) => {
                                        const yearOption = new Date().getFullYear() - i;
                                        return (
                                            <SelectItem key={yearOption} value={yearOption.toString()}>
                                                {yearOption}
                                            </SelectItem>
                                        );
                                    })
                                )}
                            </SelectContent>
                        </Select>

                        <Select
                            value={month?.toString() ?? "all"}
                            onValueChange={(value) => setMonth(value === "all" ? null : parseInt(value))}
                        >
                            <SelectTrigger className="w-[150px] bg-muted/30 border-0">
                                <SelectValue placeholder="Todos los meses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los meses</SelectItem>
                                {MONTHS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2 ml-2">
                            <span className="text-sm font-medium">Días:</span>
                            <Input
                                type="number"
                                value={dias}
                                onChange={(e) => setDias(parseInt(e.target.value) || 4)}
                                className="w-16 h-9 bg-muted/30 border-0 text-center"
                                min="1"
                            />
                            <span className="text-sm text-muted-foreground">(mayor a)</span>
                        </div>

                        <div className="ml-auto flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="gap-2 border-0 bg-muted/30 hover:bg-muted/50"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Actualizar
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Tabla */}
            <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-red-500" />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-semibold">Lista de Viajes No Facturados</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    {viajes.length} clientes con viajes pendientes
                                </p>
                            </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                            <Search className="h-3 w-3 mr-1" />
                            {totalViajes} viajes
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {viajes.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="h-20 w-20 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
                                <Truck className="h-10 w-10 text-green-500" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">¡Todo al día!</h3>
                            <p className="text-muted-foreground mt-1">
                                No hay viajes no facturados con más de {dias} días de antigüedad
                            </p>
                            <p className="text-sm text-muted-foreground/70 mt-2">
                                Todos los viajes han sido facturados correctamente
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b bg-muted/30">
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Cliente
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Viajes
                                        </th>
                                        <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Producción
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Más Antiguo
                                        </th>
                                        <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Más Reciente
                                        </th>
                                        <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Códigos
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {viajes.map((item) => {
                                        const produccion = Number(item.total_produccion) || 0;
                                        const esAlta = produccion > 10000;
                                        const tendencia = getTendencia(produccion);

                                        return (
                                            <tr key={item.cliente_id} className="border-b hover:bg-muted/30 transition-colors group">
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                            {item.cliente.charAt(0).toUpperCase()}
                                                        </div>
                                                        <span className="font-medium text-sm">{item.cliente}</span>
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-4">
                                                    <Badge variant={item.total_viajes > 20 ? "outline" : "default"} className="font-medium">
                                                        {item.total_viajes}
                                                    </Badge>
                                                </td>
                                                <td className="text-right py-3 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <span className={cn(
                                                            "font-semibold text-sm",
                                                            esAlta ? "text-red-600" : "text-amber-600"
                                                        )}>
                                                            {formatCurrency(produccion)}
                                                        </span>
                                                        {tendencia === 'up' ? (
                                                            <TrendingUp className="h-3 w-3 text-green-500" />
                                                        ) : (
                                                            <TrendingDown className="h-3 w-3 text-red-500" />
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-4 text-sm">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Clock className="h-3 w-3 text-muted-foreground" />
                                                        {item.viaje_mas_antiguo}
                                                    </div>
                                                </td>
                                                <td className="text-center py-3 px-4 text-sm">
                                                    {item.viaje_mas_reciente}
                                                </td>
                                                <td className="py-3 px-4">
                                                    <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/20">
                                                        {item.codigos_viajes ? (
                                                            item.codigos_viajes.split(', ').map((codigo, idx) => (
                                                                <Badge
                                                                    key={idx}
                                                                    variant="outline"
                                                                    className="text-xs font-mono bg-muted/30 hover:bg-muted/50 transition-colors"
                                                                >
                                                                    {codigo}
                                                                </Badge>
                                                            ))
                                                        ) : (
                                                            <span className="text-muted-foreground text-sm">-</span>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Footer con resumen */}
            {viajes.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-muted-foreground bg-muted/20 p-3 rounded-lg">
                    <div>
                        Mostrando <span className="font-medium text-foreground">{viajes.length}</span> clientes
                    </div>
                    <div className="flex items-center gap-4">
                        <Badge variant="outline" className="font-normal">
                            Total viajes: <span className="font-bold ml-1">{totalViajes}</span>
                        </Badge>
                        <Badge variant="outline" className="font-normal">
                            Total producción: <span className="font-bold ml-1">{formatCurrency(totalProduccion)}</span>
                        </Badge>
                    </div>
                </div>
            )}
        </div>
    );
}