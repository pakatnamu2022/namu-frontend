import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, AlertTriangle, Info } from "lucide-react";
import type { AdoptionAlert } from "../lib/adoption.interface";

interface Props {
  data: AdoptionAlert[];
}

const severityConfig: Record<
  string,
  { icon: typeof AlertTriangle; bg: string; border: string; iconColor: string; label: string }
> = {
  high: {
    icon: AlertTriangle,
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600",
    label: "Alta",
  },
  medium: {
    icon: AlertTriangle,
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800",
    iconColor: "text-amber-600",
    label: "Media",
  },
  low: {
    icon: Info,
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600",
    label: "Baja",
  },
};

const typeLabel: Record<string, string> = {
  inactive_user: "Usuario inactivo",
  lagging_sede: "Sede rezagada",
  activity_drop: "Caída de actividad",
  low_module_usage: "Módulo subutilizado",
};

export default function AdoptionAlerts({ data }: Props) {
  const sorted = [...data].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return (order[a.severity] ?? 3) - (order[b.severity] ?? 3);
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bell className="size-4 text-red-500" />
          Alertas Automáticas
          {data.length > 0 && (
            <span className="ml-1 text-xs font-semibold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
              {data.length}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-muted-foreground">
            <Bell className="size-8 opacity-30" />
            <p className="text-sm">Sin alertas activas en el período</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[360px] overflow-y-auto">
            {sorted.map((alert, i) => {
              const cfg = severityConfig[alert.severity] ?? severityConfig.low;
              const IconComp = cfg.icon;
              return (
                <div
                  key={i}
                  className={`flex items-start gap-3 rounded-lg border p-3 ${cfg.bg} ${cfg.border}`}
                >
                  <IconComp className={`size-4 mt-0.5 shrink-0 ${cfg.iconColor}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold">{alert.entity}</span>
                      <span className="text-xs text-muted-foreground">
                        {alert.sede && `· ${alert.sede}`}
                      </span>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                          alert.severity === "high"
                            ? "bg-red-100 text-red-700"
                            : alert.severity === "medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {typeLabel[alert.type] ?? alert.type}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">{alert.message}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
