// Componente de KPIs

import { useState } from "react";
import { CheckCircle2, Clock, LucideIcon, Users, XCircle } from "lucide-react";
import { ProgressStats } from "../../evaluaciones/lib/evaluation.interface";
import { Card, CardContent } from "@/components/ui/card";
import PersonResultsSheet from "./PersonResultsSheet";
import { usePersonResultsByType } from "../lib/usePersonResults";

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
  evaluationId: number;
}

export const KPICards: React.FC<KPICardsProps> = ({
  progressStats,
  evaluationId,
}) => {
  const [selectedCardType, setSelectedCardType] = useState<
    "total" | "completed" | "in_progress" | "not_started" | null
  >(null);

  const {
    data: personResults = [],
    isLoading,
    error,
  } = usePersonResultsByType(evaluationId, selectedCardType || "total");

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

  const handleCardClick = (
    type: "total" | "completed" | "in_progress" | "not_started"
  ) => {
    setSelectedCardType(type);
  };

  const handleCloseSheet = () => {
    setSelectedCardType(null);
  };

  const getSheetTitle = () => {
    if (!selectedCardType) return "";
    const kpi = kpis.find((k) => k.type === selectedCardType);
    return `${kpi?.label} (${kpi?.value})`;
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi: KPIItem, index: number) => {
          const IconComponent = kpi.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick(kpi.type)}
            >
              <CardContent className="p-6">
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

      <PersonResultsSheet
        open={selectedCardType !== null}
        onClose={handleCloseSheet}
        title={getSheetTitle()}
        data={personResults}
        isLoading={isLoading}
        error={error}
      />
    </>
  );
};
