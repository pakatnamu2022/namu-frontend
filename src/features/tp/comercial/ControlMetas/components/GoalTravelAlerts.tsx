"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, Truck, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertsGoalTravel, useAvailableYearsGoalTravel } from "../lib/GoalTravelControl.hook";
import { useState } from "react";
import { MONTHS } from "../lib/GoalTravelControl.constants";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";



export default function GoalTravelAlerts() {
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);


    const { data: alerts, isLoading, error } = useAlertsGoalTravel(year, month);
    const { data: availableYears = [] } = useAvailableYearsGoalTravel();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="text-center py-8 text-red-500">
                    Error al cargar alertas: {(error as Error).message}
                </CardContent>
            </Card>
        );
    }

    const totalAlerts = (alerts?.conductores?.length || 0) + (alerts?.vehiculos?.length || 0);


    if (totalAlerts === 0) {
        return (
            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4">
                        <CardTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-green-500" />
                            Alertas de Cumplimiento
                        </CardTitle>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm font-medium">Período:</span>
                            </div>
                            <Select
                                value={month.toString()}
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
                                    {availableYears.length > 0 ? (
                                        availableYears.map((y) => (
                                            <SelectItem key={y} value={y.toString()}>
                                                {y}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        // Si no hay años disponibles, mostrar años recientes
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
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                        <div className="text-2xl mb-2">✅</div>
                        <p>Todos los conductores y vehículos están cumpliendo con sus metas</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            para {MONTHS.find(m => m.value === month.toString())?.label} {year}
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-red-200 bg-red-50">
            <CardHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-red-700">
                            <AlertTriangle className="h-5 w-5" />
                            Alertas de Bajo Cumplimiento
                            <Badge variant="outline" className="ml-2">
                                {totalAlerts}
                            </Badge>
                        </CardTitle>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Período:</span>
                        </div>
                        <Select
                            value={month.toString()}
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
                                {availableYears.length > 0 ? (
                                    availableYears.map((y) => (
                                        <SelectItem key={y} value={y.toString()}>
                                            {y}
                                        </SelectItem>
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
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {alerts?.conductores && alerts.conductores.length > 0 && (
                    <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Conductores
                        </h4>
                        <ul className="space-y-2">
                            {alerts.conductores.map((item) => (
                                <li key={item.conductor_id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                                    <span>
                                        <strong>{item.conductor}</strong>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            ({item.total_viajes} viajes · S/. {item.produccion.toFixed(2)})
                                        </span>
                                    </span>
                                    <Badge variant="outline">
                                        {item.porcentaje}% (Meta: S/. {item.meta.toFixed(2)})
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {alerts?.vehiculos && alerts.vehiculos.length > 0 && (
                    <div>
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                            <Truck className="h-4 w-4" />
                            Vehículos
                        </h4>
                        <ul className="space-y-2">
                            {alerts.vehiculos.map((item) => (
                                <li key={item.vehiculo_id} className="flex items-center justify-between p-2 bg-white rounded shadow-sm">
                                    <span>
                                        <strong>{item.vehiculo}</strong>
                                        <span className="text-sm text-muted-foreground ml-2">
                                            ({item.total_viajes} viajes · S/. {item.produccion.toFixed(2)})
                                        </span>
                                    </span>
                                    <Badge variant="outline">
                                        {item.porcentaje}% (Meta: S/. {item.meta.toFixed(2)})
                                    </Badge>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}