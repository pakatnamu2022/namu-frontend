"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Users, Truck } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertsGoalTravel } from "../lib/GoalTravelControl.hook";



export default function GoalTravelAlerts() {
    const { data: alerts, isLoading, error } = useAlertsGoalTravel();

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
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-green-500" />
                        Alertas de Cumplimiento
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                        <div className="text-2xl mb-2">✅</div>
                        <p>Todos los conductores y vehículos están cumpliendo con sus metas</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="border-red-200 bg-red-50">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="h-5 w-5" />
                    Alertas de Bajo Cumplimiento
                    <Badge variant="outline" className="ml-2">
                        {totalAlerts}
                    </Badge>
                </CardTitle>
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