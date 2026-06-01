import { Users, Wifi, AlertTriangle, WifiOff, HelpCircle } from "lucide-react";
import { StatsBarProps } from "../lib/monitoreo.interface";



export function StatsBar({ stats, isLoading }: StatsBarProps) {
    if (isLoading || !stats) {
        return (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
                ))}
            </div>
        );
    }

    const statItems = [
        {
            label: "Total",
            value: stats.total_drivers,
            Icon: Users,
            color: "text-foreground",
            bgColor: "bg-muted/50",
        },
        {
            label: "Activos",
            value: stats.active,
            Icon: Wifi,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            label: "Inactivos",
            value: stats.inactive,
            Icon: AlertTriangle,
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
        {
            label: "Desconectados",
            value: stats.disconnected,
            Icon: WifiOff,
            color: "text-red-600",
            bgColor: "bg-red-50",
        },
        {
            label: "Sin Datos",
            value: stats.without_location,
            Icon: HelpCircle,
            color: "text-gray-500",
            bgColor: "bg-gray-100",
        }
    ];

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {statItems.map((item) => (
                <div
                    key={item.label}
                    className={`flex items-center gap-3 rounded-lg border border-border p-4 shadow-sm ${item.bgColor}`}
                >
                    <item.Icon className={`h-5 w-5 ${item.color}`} />
                    <div>
                        <p className="text-2xl font-bold text-foreground">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}