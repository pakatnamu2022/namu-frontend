"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, TrendingUp, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useRankingGoalTravel, useAvailableYearsGoalTravel } from "../lib/GoalTravelControl.hook";
import { MONTHS } from "../lib/GoalTravelControl.constants";



export default function RankingConductores() {
    const [periodo, setPeriod] = useState<"week" | "month">("month");
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
    const { data: ranking, isLoading, error } = useRankingGoalTravel(periodo, 10, year, month);
    const { data: availableYears = [] } = useAvailableYearsGoalTravel();


    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-14 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="text-center py-8 text-red-500">
                    Error al cargar el ranking: {(error as Error).message}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-500" />
                            Ranking de Conductores
                        </CardTitle>
                        <Tabs value={periodo} onValueChange={(v) => setPeriod(v as any)}>
                            <TabsList>
                                <TabsTrigger value="week">Semanal</TabsTrigger>
                                <TabsTrigger value="month">Mensual</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Período:</span>
                        </div>
                        <Select
                            value={month?.toString()}
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
                                    <>
                                        <SelectItem value="2024">2024</SelectItem>
                                        <SelectItem value="2023">2023</SelectItem>
                                        <SelectItem value="2022">2022</SelectItem>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {!ranking || ranking.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground/50" />
                        No hay datos para el período seleccionado
                    </div>
                ) : (
                    <div className="space-y-2">
                        {ranking.map((item) => (
                            <div
                                key={item.conductor_id}
                                className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                            >
                                <div className="w-8 text-center font-bold text-lg">
                                    {item.medal || `#${item.position}`}
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold">{item.conductor}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {item.total_viajes} viajes · S/. {item.produccion_total?.toFixed(2) || "0.00"}
                                        {item.periodo && (
                                            <span className="ml-2 text-xs text-muted-foreground">
                                                ({item.periodo})
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <Badge variant="outline" className="font-semibold">
                                        <TrendingUp className="h-3 w-3 mr-1" />
                                        S/. {item.promedio_por_viaje?.toFixed(2) || "0.00"}/viaje
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}