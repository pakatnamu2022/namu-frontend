import { Circle, AlertTriangle, WifiOff, Minus } from "lucide-react";
import { StatusBadgeProps } from "../lib/monitoreo.interface";
import { STATUS_CONFIG } from "../lib/monitoreo.constants";


export function StatusBadge({ status }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.nodata;

    const getIcon = () => {
        switch (status) {
            case "active":
                return <Circle className="h-3 w-3 fill-current" />;
            case "inactive":
                return <AlertTriangle className="h-3 w-3" />;
            case "disconnected":
                return <WifiOff className="h-3 w-3" />;
            default:
                return <Minus className="h-3 w-3" />;
        }
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bgClass} ${config.textClass} border ${config.borderClass}`}
        >
            {getIcon()}
            {config.label}
        </span>
    )
}