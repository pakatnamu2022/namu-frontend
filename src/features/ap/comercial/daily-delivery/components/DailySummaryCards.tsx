import { Car, Truck, TrendingUp } from "lucide-react";
import { DailyDeliverySummary } from "../lib/daily-delivery.interface";

interface DailySummaryCardsProps {
  summary: DailyDeliverySummary;
}

const CATEGORY_STYLES: Record<string, { icon: typeof Car; color: string }> = {
  "VEHICULOS NUEVO": { icon: Car, color: "bg-blue-500" },
  "CAMIONES NUEVO": { icon: Truck, color: "bg-emerald-500" },
};

const DEFAULT_STYLE = { icon: Car, color: "bg-slate-500" };

const titleCase = (value: string) =>
  value
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function DailySummaryCards({
  summary,
}: DailySummaryCardsProps) {
  const categoryCards = Object.entries(summary)
    .filter(([key]) => key !== "TOTAL")
    .map(([key, data]) => ({
      title: titleCase(key),
      icon: CATEGORY_STYLES[key]?.icon ?? DEFAULT_STYLE.icon,
      color: CATEGORY_STYLES[key]?.color ?? DEFAULT_STYLE.color,
      data,
    }));

  const cards = [
    ...categoryCards,
    {
      title: "Total General",
      icon: TrendingUp,
      color: "bg-violet-500",
      data: summary.TOTAL,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className="relative overflow-hidden rounded-lg border bg-card text-card-foreground transition-all hover:shadow-sm"
          >
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {card.title}
                </span>
                <div className={`${card.color} p-1.5 rounded-md`}>
                  <Icon className="h-3 w-3 text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">
                    Entregas
                  </div>
                  <div className="text-xl font-bold tracking-tight">
                    {card.data.entregas}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">
                    Facturadas
                  </div>
                  <div className="text-xl font-bold tracking-tight text-emerald-600">
                    {card.data.facturadas}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
