// Componente de KPIs

import { CheckCircle2, Clock, LucideIcon, Users, XCircle } from "lucide-react";
import { ProgressStats } from "../../evaluaciones/lib/evaluation.interface";
import { Card, CardContent } from "@/components/ui/card";
import { KPICardType } from "../lib/kpi.utils";

interface KPIItem {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  labelColor: string;
  type: "total" | "completed" | "in_progress" | "not_started";
}

interface KPICardsProps {
  progressStats: ProgressStats;
  selectedCardType: KPICardType | null;
  onCardClick: (type: KPICardType) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({
  progressStats,
  selectedCardType,
  onCardClick,
}) => {

  const kpis: KPIItem[] = [
    {
      label: "Total Participantes",
      value: progressStats.total_participants,
      icon: Users,
      color: "text-primary",
      labelColor: "text-muted-foreground",
      type: "total",
    },
    {
      label: "Completadas",
      value: progressStats.completed_participants,
      icon: CheckCircle2,
      color: "text-primary",
      labelColor: "text-primary",
      type: "completed",
    },
    {
      label: "En Progreso",
      value: progressStats.in_progress_participants,
      icon: Clock,
      color: "text-muted-foreground",
      labelColor: "text-muted-foreground",
      type: "in_progress",
    },
    {
      label: "Sin Iniciar",
      value: progressStats.not_started_participants,
      icon: XCircle,
      color: "text-secondary",
      labelColor: "text-secondary",
      type: "not_started",
    },
  ];

  return (
    <div className="flex flex-col justify-between gap-2 h-full">
      {kpis.map((kpi: KPIItem, index: number) => {
        const IconComponent = kpi.icon;
        const isSelected = selectedCardType === kpi.type;
        return (
          <Card
            key={index}
            className={`hover:shadow-md transition-all cursor-pointer ${
              isSelected ? "ring-2 ring-primary shadow-md" : ""
            }`}
            onClick={() => onCardClick(kpi.type)}
          >
            <CardContent className="p-4 px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm font-medium ${kpi.labelColor}`}>
                    {kpi.label}
                  </p>
                  <p className={`text-2xl font-semibold ${kpi.color}`}>
                    {kpi.value}
                  </p>
                </div>
                <IconComponent className={`h-8 w-8 ${kpi.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
