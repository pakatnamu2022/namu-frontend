"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar, Truck, AlertCircle, RefreshCw } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useViajesNoFacturados, useAvailableYearsGoalTravel } from "../lib/GoalTravelControl.hook";
import { MONTHS } from "../lib/GoalTravelControl.constants";

export default function ViajesNoFacturados() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number | null>(null); // null = "Todos los meses"
    const [dias, setDias] = useState<number>(4);

    const { data, isLoading, error, refetch } = useViajesNoFacturados(dias, year, month ?? undefined);
    const { data: availableYears = [] } = useAvailableYearsGoalTravel();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-32 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="text-center py-8 text-red-500">
                    Error al cargar viajes no facturados: {(error as Error).message}
                </CardContent>
            </Card>
        );
    }

    const totalViajes = data?.resumen?.total_viajes || 0;
    const totalProduccion = data?.resumen?.total_produccion || 0;
    const fechaLimite = data?.resumen?.fecha_limite || "";
    const viajes = data?.data || [];

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500" />
                            Viajes No Facturados
                            <Badge variant="outline" className="ml-2">
                                {totalViajes}
                            </Badge>
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => refetch()}
                                className="gap-2"
                            >
                                <RefreshCw className="h-4 w-4" />
                                Actualizar
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Año:</span>
                        </div>
                        <Select
                            value={year.toString()}
                            onValueChange={(value) => setYear(parseInt(value))}
                        >
                            <SelectTrigger className="w-[120px]">
                                <SelectValue placeholder="Año" />
                            </SelectTrigger>
                            <SelectContent>
                                {availableYears.length > 0 ? (
                                    availableYears.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
                                    ))
                                ) : (
                                    // Si no hay años en metas, mostrar años recientes
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

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Mes:</span>
                        </div>
                        <Select
                            value={month?.toString() ?? "all"}
                            onValueChange={(value) => setMonth(value === "all" ? null : parseInt(value))}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Todos los meses" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos los meses</SelectItem>
                                {MONTHS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>
                                        {m.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Días:</span>
                        </div>
                        <Input
                            type="number"
                            value={dias}
                            onChange={(e) => setDias(parseInt(e.target.value) || 4)}
                            className="w-16 h-8"
                            min="1"
                        />
                        <span className="text-sm text-muted-foreground">(mayor a)</span>
                    </div>

                    {totalViajes > 0 && (
                        <div className="bg-muted/30 p-3 rounded-lg grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <span className="text-sm text-muted-foreground">Total Viajes</span>
                                <p className="text-xl font-bold">{totalViajes}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Total Producción</span>
                                <p className="text-xl font-bold">S/. {totalProduccion.toFixed(2)}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Fecha Límite</span>
                                <p className="text-xl font-bold">{fechaLimite}</p>
                            </div>
                            <div>
                                <span className="text-sm text-muted-foreground">Período</span>
                                <p className="text-xl font-bold">
                                    {year}
                                    {month ? ` - ${MONTHS.find(m => m.value === month.toString())?.label}` : ' (todos)'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {viajes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Truck className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                        <p>No hay viajes no facturados con más de {dias} días</p>
                        <p className="text-sm">Todos los viajes han sido facturados correctamente</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left py-2 font-medium">Cliente</th>
                                    <th className="text-center py-2 font-medium">Viajes</th>
                                    <th className="text-right py-2 font-medium">Producción</th>
                                    <th className="text-center py-2 font-medium">Más Antiguo</th>
                                    <th className="text-center py-2 font-medium">Más Reciente</th>
                                    <th className="text-left py-2 font-medium">Códigos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {viajes.map((item) => (
                                    <tr key={item.cliente_id} className="border-b hover:bg-muted/50">
                                        <td className="py-2 font-medium">{item.cliente}</td>
                                        <td className="text-center py-2">
                                            <Badge variant="outline">{item.total_viajes}</Badge>
                                        </td>
                                        <td className="text-right py-2">
                                            S/. {Number(item.total_produccion).toFixed(2) || "0.00"}
                                        </td>
                                        <td className="text-center py-2 text-sm">{item.viaje_mas_antiguo}</td>
                                        <td className="text-center py-2 text-sm">{item.viaje_mas_reciente}</td>
                                        <td className="py-2 text-xs">
                                            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                                                {item.codigos_viajes ? (
                                                    item.codigos_viajes.split(', ').map((codigo, idx) => (
                                                        <Badge key={idx} variant="outline" className="text-xs whitespace-nowrap">
                                                            {codigo}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}