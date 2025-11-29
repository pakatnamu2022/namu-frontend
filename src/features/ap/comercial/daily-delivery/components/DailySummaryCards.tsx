import { Package, TrendingUp, Truck } from "lucide-react";
import { DailyDeliverySummary } from "../lib/daily-delivery.interface";

interface DailySummaryCardsProps {
  summary: DailyDeliverySummary;
}

export default function DailySummaryCards({ summary }: DailySummaryCardsProps) {
  const cards = [
    {
      title: "Livianos",
      icon: Package,
      color: "bg-blue-500",
      data: summary.TOTAL_AP_LIVIANOS,
    },
    {
      title: "Camiones",
      icon: Truck,
      color: "bg-emerald-500",
      data: summary.TOTAL_AP_CAMIONES,
    },
    {
      title: "Total General",
      icon: TrendingUp,
      color: "bg-violet-500",
      data: summary.TOTAL_AP,
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
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
                  <div className="text-xs text-muted-foreground mb-0.5">Entregas</div>
                  <div className="text-xl font-bold tracking-tight">{card.data.entregas}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground mb-0.5">Facturación</div>
                  <div className="text-sm font-semibold text-emerald-600">
                    {formatCurrency(card.data.facturacion)}
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
