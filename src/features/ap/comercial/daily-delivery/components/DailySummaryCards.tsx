import { Package, TrendingUp, Truck } from "lucide-react";
import {
  BrandReportSection,
  DailyDeliverySummary,
} from "../lib/daily-delivery.interface";

interface DailySummaryCardsProps {
  summary: DailyDeliverySummary;
  brandReport: BrandReportSection[];
}

export default function DailySummaryCards({
  summary,
  brandReport,
}: DailySummaryCardsProps) {
  // Obtener totales por grupo de marca desde brand_report
  const getBrandGroupTotals = (groupName: string) => {
    const section = brandReport.find(
      (s) => s.title.toUpperCase() === groupName.toUpperCase()
    );
    return {
      entregas: section?.total_entregas ?? 0,
      facturadas: section?.total_facturadas ?? 0,
    };
  };

  const brandTotals = {
    TRADICIONAL: getBrandGroupTotals("TRADICIONAL"),
    CHINA: getBrandGroupTotals("CHINA"),
    INCHCAPE: getBrandGroupTotals("INCHCAPE"),
  };

  const cards = [
    {
      title: "Tradicional",
      icon: Package,
      color: "bg-blue-500",
      data: {
        entregas: brandTotals.TRADICIONAL.entregas,
        facturadas: brandTotals.TRADICIONAL.facturadas,
        reporteria_dealer_portal: null,
      },
    },
    {
      title: "China",
      icon: Truck,
      color: "bg-emerald-500",
      data: {
        entregas: brandTotals.CHINA.entregas,
        facturadas: brandTotals.CHINA.facturadas,
        reporteria_dealer_portal: null,
      },
    },
    {
      title: "Inchcape",
      icon: Truck,
      color: "bg-amber-500",
      data: {
        entregas: brandTotals.INCHCAPE.entregas,
        facturadas: brandTotals.INCHCAPE.facturadas,
        reporteria_dealer_portal: null,
      },
    },
    {
      title: "Total General",
      icon: TrendingUp,
      color: "bg-violet-500",
      data: summary.TOTAL,
    },
  ];

  // const formatCurrency = (value: number) => {
  //   return new Intl.NumberFormat("es-PE", {
  //     style: "currency",
  //     currency: "PEN",
  //     minimumFractionDigits: 0,
  //     maximumFractionDigits: 0,
  //   }).format(value);
  // };

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
