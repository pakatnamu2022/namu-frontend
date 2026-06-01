
import { MapPin, Clock } from "lucide-react";
import { useEffect, useState } from "react";

export function FleetHeader() {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        //actualizar cada minuto
        const updateTime = () => setTime(new Date());
        updateTime();

        const id = setInterval(updateTime, 60000);

        return () => clearInterval(id);
    }, []);

    function formatDateTime(date: Date): string {
        return `${date.toLocaleDateString("es-PE", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric",
        })}{" "}
                · ${date.toLocaleTimeString("es-PE",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            })}`
    }

    return (
        <header className="bg-header text-header-foreground">
            <div className="container mx-auto flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                        <MapPin className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold tracking-tight">FlotaSegura</h1>
                        <p className="text-xs opacity-75">Monitoreo de Flota en Tiempo Real</p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-80">
                    <Clock className="h-4 w-4" />
                    <span>{formatDateTime(time)}</span>
                </div>
            </div>
        </header>
    );
}